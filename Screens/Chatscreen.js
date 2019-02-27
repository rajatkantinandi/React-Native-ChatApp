import React from "react";
import { View, FlatList, StyleSheet, AsyncStorage, Alert } from "react-native";
import Message from "../Components/Message";
import InputArea from "../Components/InputArea";
import credentials from "../credentials";
import Prompt from "rn-prompt";
import requestApi from "../requestApi";
import {
  ChatManager,
  TokenProvider
} from "@pusher/chatkit-client/react-native";
class Chatscreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("roomName", "Default")
    };
  };
  state = {
    name: this.props.navigation.getParam("name"),
    id: this.props.navigation.getParam("id"),
    messages: [],
    roomName: this.props.navigation.getParam("roomName"),
    roomId: this.props.navigation.getParam("roomId"),
    activity: true,
    currentUser: null,
    promptAddUserVisible: false,
    promptRenameVisible: false
  };
  _keyExtractor = (item, index) => "" + index;
  componentDidMount = async () => {
    await this.getAllMessagesLocal();
    const chatManager = new ChatManager({
      instanceLocator: credentials.INSTANCE_LOCATOR,
      userId: this.state.id,
      tokenProvider: new TokenProvider({
        url: credentials.SERVER_URL + "/tokenProvider"
      })
    });
    const currentUser = await chatManager.connect();
    await this.setState({ currentUser });
    try {
      this.state.currentUser.subscribeToRoom({
        roomId: this.state.roomId,
        hooks: {
          onMessage: message => {
            this.getAllMessages();
          }
        },
        messageLimit: 1
      });
    } catch (err) {
      alert("Error on connection: " + JSON.stringify(err));
    }
  };
  componentDidUpdate = async () => {
    await AsyncStorage.setItem(
      "room:" + this.state.roomId,
      JSON.stringify(this.state.messages)
    );
  };
  sendMessage = async text => {
    this.setState({
      messages: [...this.state.messages, { user_id: this.state.id, text: text }]
    });
    const url = credentials.SERVER_URL + "/sendMessage";
    const data = {
      instanceLocator: credentials.INSTANCE_LOCATOR,
      key: credentials.SECRET_KEY,
      roomId: this.state.roomId,
      id: this.state.id,
      text: text
    };
    const response = await requestApi(url, data);
    if (response.ok) {
      const message = await response.json();
      console.log(`Added message: ` + message.messageId);
    } else {
      console.log(`Error adding message : ${response.statusText}`);
    }
  };
  getAllMessagesLocal = async () => {
    let messages = await AsyncStorage.getItem("room:" + this.state.roomId);
    if (messages) {
      messages = JSON.parse(messages);
      this.setState({ messages });
    }
  };
  getAllMessages = async () => {
    const url = credentials.SERVER_URL + "/getRoomMessages";
    const sentMessages = this.state.messages.filter(message =>
      message.hasOwnProperty("id")
    );
    const initialId =
      sentMessages.length > 0 ? sentMessages[sentMessages.length - 1].id : null;
    const data = {
      instanceLocator: credentials.INSTANCE_LOCATOR,
      key: credentials.SECRET_KEY,
      roomId: this.state.roomId,
      initialId: initialId
    };
    const response = await requestApi(url, data);
    const result = await response.json();
    if (response.ok) {
      const messages = [...sentMessages, ...result];
      console.log(JSON.stringify(result));
      this.setState({ messages });
    } else alert(response.statusTxt);
    this.setState({ activity: false });
  };
  leaveRoom = () => {
    Alert.alert(
      "Leave Room ?",
      'Are you sure to leave "' +
        this.state.roomName +
        "\" room?\nThis action can't be undone",
      [
        {
          text: "Yes",
          onPress: () => {
            if (this.state.currentUser) {
              this.state.currentUser
                .leaveRoom({ roomId: this.state.roomId })
                .then(room => {
                  this.props.navigation.goBack();
                })
                .catch(err => {
                  console.log(`Error leaving room ${someRoomID}: ${err}`);
                });
            }
          }
        },
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        }
      ],
      { cancelable: false }
    );
  };
  addUser = userId => {
    if (this.state.currentUser) {
      this.state.currentUser
        .addUserToRoom({ userId: userId, roomId: this.state.roomId })
        .then(() => {
          this.setState({ promptAddUserVisible: false });
          alert("Added " + userId + " to room: " + this.state.roomName);
        })
        .catch(err => {
          alert(`Error : UserID does not exist`);
        });
    }
  };
  renameRoom = newName => {
    if (this.state.currentUser) {
      this.state.currentUser
        .updateRoom({
          roomId: this.state.roomId,
          name: newName
        })
        .then(() => {
          this.setState({ roomName: newName, promptRenameVisible: false });
          this.props.navigation.setParams({ roomName: newName });
        })
        .catch(err => {
          console.log(`Error updated room ${someRoomID}: ${err}`);
        });
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={[...this.state.messages].reverse()}
          renderItem={({ item }) => (
            <Message
              from={item.user_id}
              text={item.text}
              sent={item.user_id === this.state.id}
              posted={item.hasOwnProperty("id")}
            />
          )}
          keyExtractor={this._keyExtractor}
          style={styles.page}
          inverted
        />
        <Prompt
          title="Rename this Room"
          placeholder="Enter new Room Name"
          visible={this.state.promptRenameVisible}
          onSubmit={value => this.renameRoom(value)}
          onCancel={() => this.setState({ promptRenameVisible: false })}
        />
        <Prompt
          title="Add a new User to this Room"
          placeholder="Enter User Id"
          visible={this.state.promptAddUserVisible}
          onSubmit={value => this.addUser(value)}
          onCancel={() => this.setState({ promptAddUserVisible: false })}
        />
        <InputArea
          onSend={text => this.sendMessage(text)}
          leaveRoom={this.leaveRoom}
          renameRoom={() => this.setState({ promptRenameVisible: true })}
          addUser={() => this.setState({ promptAddUserVisible: true })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  page: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fee",
    zIndex: 1
  }
});
export default Chatscreen;
