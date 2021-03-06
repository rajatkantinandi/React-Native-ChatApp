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
    creator: this.props.navigation.getParam("creator"),
    activity: true,
    currentUser: null,
    promptAddUserVisible: false,
    promptRenameVisible: false,
    loading: true,
    activity: false,
    activityText: "Please wait.."
  };

  _keyExtractor = (item, index) => "" + (item.id || index);

  componentWillReceiveProps = async nextProps => {
    if (this.state.currentUser)
      this.state.currentUser.roomSubscriptions[this.state.roomId].cancel();
    await AsyncStorage.setItem(
      "room:" + this.state.roomId,
      JSON.stringify(this.state.messages)
    );
    if (this.mounted)
      await this.setState({
        name: nextProps.navigation.getParam("name"),
        id: nextProps.navigation.getParam("id"),
        roomId: nextProps.navigation.getParam("roomId"),
        roomName: nextProps.navigation.getParam("roomName"),
        creator: nextProps.navigation.getParam("creator"),
        loading: true
      });
    await this.getAllMessagesLocal();
    await this.connectToChat();
  };

  connectToChat = async () => {
    const chatManager = new ChatManager({
      instanceLocator: credentials.INSTANCE_LOCATOR,
      userId: this.state.id,
      tokenProvider: new TokenProvider({
        url: credentials.TOKEN_PROVIDER_URL
      })
    });
    const currentUser = await chatManager.connect();
    if (this.mounted) await this.setState({ currentUser });
    try {
      if (this.state.currentUser) {

        this.state.currentUser.subscribeToRoom({
          roomId: this.state.roomId,
          hooks: {
            onMessage: message => {
              this.getAllMessages();
            }
          },
          messageLimit: 1
        });
      }
    } catch (err) {
      alert("Error on connection: " + JSON.stringify(err));
    }
  };

  componentDidMount = async () => {
    this.mounted = true;
    await this.getAllMessagesLocal();
    await this.connectToChat();
  };

  componentWillUnmount = async () => {
    if (this.state.currentUser) {
      this.state.currentUser.roomSubscriptions[this.state.roomId].cancel();
    }
    await AsyncStorage.setItem(
      "room:" + this.state.roomId,
      JSON.stringify(this.state.messages)
    );
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
      console.log(
        `Error adding message or only one user : ${response.statusText}`
      );
    }
  };

  getAllMessagesLocal = async () => {
    let messages = await AsyncStorage.getItem("room:" + this.state.roomId);
    if (messages) {
      messages = JSON.parse(messages);
    } else messages = [];
    if (this.mounted) await this.setState({ messages });
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
                  this.setState({ activity: false }, () => {
                    setTimeout(() => this.props.navigation.goBack(), 200);
                  });
                })
                .catch(err => {
                  this.setState({ activity: false });
                  console.log(
                    `Error leaving room ${this.state.roomName}: ${err}`
                  );
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

  deleteRoom = () => {
    if (this.state.creator === this.state.id) {
      Alert.alert(
        "Delete Room ?",
        'Are you sure to delete "' +
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
                    activityText: "Deleting room, Please wait..."
                  });
                this.state.currentUser
                  .deleteRoom({ roomId: this.state.roomId })
                  .then(() => {
                    this.setState({ activity: false }, () => {
                      console.log(this.state.activity);
                      this.props.navigation.goBack();
                    });
                  })
                  .catch(err => {
                    this.setState({ activity: false });
                    console.log(
                      `Error Deleting room ${this.state.roomName}: ${err}`
                    );
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
    }
  };

  addUser = async userId => {
    if (userId != "") {
      if (this.state.currentUser) {
        if (this.mounted)
          this.setState({
            activity: true,
            activityText: "Adding New user: " + userId + ", Please wait...",
            promptAddUserVisible: false,
          });
        const url = credentials.SERVER_URL + "/userAvailability";
        const data = {
          id: userId,
          instanceLocator: credentials.INSTANCE_LOCATOR,
          key: credentials.SECRET_KEY
        };
        const response = await requestApi(url, data);

        if (response.ok) {
          this.setState({ activity: false }, () => {
            setTimeout(() => alert(`Error : UserID does not exist`), 200);
          });
        } else {
          this.state.currentUser
            .addUserToRoom({ userId: userId, roomId: this.state.roomId })
            .then(() => {
              if (this.mounted) {
                this.setState({ activity: false }, () => {
                  setTimeout(() => alert("Added " + userId + " to room: " + this.state.roomName), 200);
                });
              }
            })
            .catch(err => {
              this.setState({ activity: false }, () => {
                setTimeout(() => alert(`Error : ${err.status}`), 200);
              });
            });
        }
      }
    } else {
      alert("userId must not be empty");
    }
  };

  renameRoom = newName => {
    if (this.state.currentUser && this.mounted) {
      this.setState({
        activity: true,
        activityText: "Renaming the room, Please wait...",
        promptRenameVisible: false,
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
              activity: false,
            });
          this.props.navigation.setParams({ roomName: newName });
        })
        .catch(err => {
          this.setState({ activity: false }, () => {
            setTimeout(() => console.log(`Error updated room ${someRoomID}: ${err}`), 200)
          });
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
        {this.state.activity &&
          <ProgressDialog
            visible={this.state.activity}
            text={this.state.activityText}
          />
        }
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
          title="Rename the Room"
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
          textInputProps={{
            autoCapitalize: "none"
          }}
        />
        <InputArea
          onSend={text => this.sendMessage(text)}
          leaveRoom={() => this.leaveRoom()}
          renameRoom={() => this.setState({ promptRenameVisible: true })}
          addUser={() => this.setState({ promptAddUserVisible: true })}
          isCreator={this.state.creator === this.state.id}
          deleteRoom={() => this.deleteRoom()}
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
