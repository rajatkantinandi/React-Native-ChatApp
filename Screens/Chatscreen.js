import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  AsyncStorage,
  Alert,
  ProgressBarAndroid
} from "react-native";
import Message from "../Components/Message";
import InputArea from "../Components/InputArea";
import credentials from "../credentials";
import Prompt from "rn-prompt";
import requestApi from "../requestApi";
import ProgressDialog from "../Components/ProgressDialog";

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
    promptRenameVisible: false,
    loading: true,
    activity: false,
    activityText: "Please wait.."
  };
  _keyExtractor = (item, index) => "" + index;
  componentWillReceiveProps = async nextProps => {
    if (this.mounted)
      await this.setState({
        name: nextProps.navigation.getParam("name"),
        id: nextProps.navigation.getParam("id"),
        roomId: nextProps.navigation.getParam("roomId"),
        roomName: nextProps.navigation.getParam("roomName"),
        messages: [],
        loading: true
      });
    await AsyncStorage.setItem(
      "room:" + nextProps.navigation.getParam("roomId"),
      JSON.stringify([])
    );
    await this.connectToChat();
    await this.getAllMessages();
  };
  connectToChat = async () => {
    const chatManager = new ChatManager({
      instanceLocator: credentials.INSTANCE_LOCATOR,
      userId: this.state.id,
      tokenProvider: new TokenProvider({
        url: credentials.SERVER_URL + "/tokenProvider"
      })
    });
    const currentUser = await chatManager.connect();
    if (this.mounted) await this.setState({ currentUser });
    try {
      if (this.state.currentUser)
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
  componentDidMount = async () => {
    this.mounted = true;
    await this.getAllMessagesLocal();
    await this.connectToChat();
  };
  componentDidUpdate = async () => {
    await AsyncStorage.setItem(
      "room:" + this.state.roomId,
      JSON.stringify(this.state.messages)
    );
  };
  componentWillUnmount = () => {
    if (this.state.currentUser)
      this.state.currentUser.roomSubscriptions[this.state.roomId].cancel();
    this.mounted = false;
  };
  sendMessage = async text => {
    if (this.mounted)
      this.setState({
        messages: [
          ...this.state.messages,
          { user_id: this.state.id, text: text }
        ]
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
      if (this.mounted) this.setState({ messages });
    }
  };
  getAllMessages = async () => {
    if (this.mounted) {
      const url = credentials.SERVER_URL + "/getRoomMessages";
      const sentMessages = this.state.messages.filter(message =>
        message.hasOwnProperty("id")
      );
      const initialId =
        sentMessages.length > 0
          ? sentMessages[sentMessages.length - 1].id
          : null;
      const data = {
        instanceLocator: credentials.INSTANCE_LOCATOR,
        key: credentials.SECRET_KEY,
        roomId: this.state.roomId,
        initialId: initialId
      };
      if (this.mounted) this.setState({ loading: true });
      const response = await requestApi(url, data);
      const result = await response.json();
      if (response.ok) {
        const messages = [...sentMessages, ...result];
        if (this.mounted) this.setState({ messages });
      } else alert(response.statusTxt);
      if (this.mounted) this.setState({ loading: false });
    }
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
              if (this.mounted)
                this.setState({
                  activity: true,
                  activityText: "Leaving room, Please wait..."
                });
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
      if (this.mounted)
        this.setState({
          activity: true,
          activityText: "Adding New user: " + userId + ", Please wait..."
        });
      this.state.currentUser
        .addUserToRoom({ userId: userId, roomId: this.state.roomId })
        .then(() => {
          if (this.mounted)
            this.setState({ promptAddUserVisible: false, activity: false });
          alert("Added " + userId + " to room: " + this.state.roomName);
        })
        .catch(err => {
          alert(`Error : UserID does not exist`);
        });
    }
  };
  renameRoom = newName => {
    if (this.state.currentUser) {
      if (this.mounted)
        this.setState({
          activity: true,
          activityText: "Renaming the room, Please wait..."
        });
      this.state.currentUser
        .updateRoom({
          roomId: this.state.roomId,
          name: newName
        })
        .then(() => {
          if (this.mounted)
            this.setState({
              roomName: newName,
              promptRenameVisible: false,
              activity: false
            });
          this.props.navigation.setParams({ roomName: newName });
        })
        .catch(err => {
          console.log(`Error updated room ${someRoomID}: ${err}`);
        });
    }
  };
  parseDate = d => {
    const twoDigits = val => ((val + "").length === 1 ? "0" + val : val);
    if (d) {
      const date = new Date(d);
      return (
        twoDigits(date.getDate()) +
        "/" +
        twoDigits(date.getMonth() + 1) +
        " @" +
        twoDigits(date.getHours()) +
        ":" +
        twoDigits(date.getMinutes())
      );
    } else return null;
  };
  render() {
    return (
      <View style={styles.container}>
        <ProgressDialog
          visible={this.state.activity}
          text={this.state.activityText}
        />
        {this.state.loading && <ProgressBarAndroid styleAttr="Horizontal" />}
        <FlatList
          data={[...this.state.messages].reverse()}
          renderItem={({ item }) => (
            <Message
              from={item.user_id}
              text={item.text}
              sent={item.user_id === this.state.id}
              posted={item.hasOwnProperty("id")}
              at={this.parseDate(item.created_at)}
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
    backgroundColor: "#eef",
    zIndex: 1
  }
});
export default Chatscreen;
