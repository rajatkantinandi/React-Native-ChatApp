import React from "react";
import {
  View,
  StyleSheet,
  AsyncStorage,
  FlatList,
  Alert,
  ProgressBarAndroid
} from "react-native";
import { Icon, Notifications } from "expo";
import credentials from "../credentials";
import requestApi from "../requestApi";
import Prompt from "rn-prompt";
import ActionButton from "react-native-action-button";
import ProgressDialog from "../Components/ProgressDialog";
import {
  ChatManager,
  TokenProvider
} from "@pusher/chatkit-client/react-native";
import Room from "../Components/Room";
class Rooms extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Rooms: [" + navigation.getParam("name", "Admin") + "]"
    };
  };
  state = {
    id: this.props.navigation.getParam("id"),
    name: this.props.navigation.getParam("name"),
    rooms: [],
    prompt: {
      title: "New Room",
      placeholder: "Enter A New Room Name",
      onSubmit: () => this.setState({ promptVisible: false }),
      onCancel: () => this.setState({ promptVisible: false })
    },
    promptVisible: false,
    token: this.props.navigation.getParam("token"),
    activity: false,
    activityText: "Please wait..",
    loading: true,
    currentUser: null
  };

  showPrompt = title => {
    if (title === "New Room") {
      const getPrompt = isPrivate => {
        return {
          title: title,
          placeholder: "Enter A New Room Name",
          onSubmit: async value => {
            if (this.state.currentUser) {
              this.setState({
                activity: true,
                activityText: "Creating new Room\nPlease wait..."
              });
              this.state.currentUser
                .createRoom({
                  name: value,
                  private: isPrivate,
                  addUserIds: [this.state.id]
                })
                .then(room => {
                  this.setState({
                    promptVisible: false,
                    activity: false
                  });
                  console.log(`Created room called ${room.name}`);
                })
                .catch(err => {
                  this.setState({
                    promptVisible: false,
                    activity: false
                  });
                  console.log(`Error creating room ${err}`);
                });
            } else alert("Connection not established.. Please wait..");
          },
          onCancel: () => this.setState({ promptVisible: false })
        };
      };
      Alert.alert(
        "Choose Kind of Room",
        "Want to create a private room or public room?",
        [
          {
            text: "Private",
            onPress: () => {
              const prompt = getPrompt(true);
              this.setState({ prompt: prompt, promptVisible: true });
            }
          },
          {
            text: "Public",
            onPress: () => {
              const prompt = getPrompt(false);
              this.setState({ prompt: prompt, promptVisible: true });
            }
          }
        ],
        { cancelable: true }
      );
    } else if (title === "Private Chat with a new User") {
      const prompt = {
        title: title,
        placeholder: "Enter the username to chat with",
        onSubmit: async value => {
          if (this.state.currentUser) {
            this.setState({
              activity: true,
              activityText: "Creating new Room\nPlease wait..."
            });
            this.state.currentUser
              .createRoom({
                name: this.state.id + " & " + value,
                private: true,
                addUserIds: [this.state.id, value]
              })
              .then(room => {
                this.setState({
                  promptVisible: false,
                  activity: false
                });
                console.log(`Created room called ${room.name}`);
              })
              .catch(err => {
                this.setState({
                  promptVisible: false,
                  activity: false
                });
                console.log(`Error creating room ${err}`);
              });
          } else alert("Connetion not established.. Please Wait...");
        },
        onCancel: () => this.setState({ promptVisible: false })
      };
      this.setState({ prompt: prompt, promptVisible: true });
    }
  };
  getRoomsLocal = async () => {
    let rooms = await AsyncStorage.getItem("rooms-" + this.state.id);
    if (rooms) this.setState({ rooms: JSON.parse(rooms) });
  };
  getRooms = async () => {
    const url = credentials.SERVER_URL + "/getRoomsByUser";
    const data = {
      instanceLocator: credentials.INSTANCE_LOCATOR,
      key: credentials.SECRET_KEY,
      id: this.state.id
    };
    this.setState({ loading: true });
    const response = await requestApi(url, data);
    const result = await response.json();
    if (response.ok) this.setState({ rooms: result, loading: false });
    else alert(result);
  };
  signOut = async () => {
    const url = credentials.SERVER_URL + "/signout";
    const data = {
      id: this.state.id,
      token: this.state.token,
      instanceLocator: credentials.INSTANCE_LOCATOR,
      key: credentials.SECRET_KEY
    };
    this.setState({
      activity: true,
      activityText: "Signing out... \nPlease Wait.."
    });
    const response = await requestApi(url, data);
    if (response.ok) {
      await AsyncStorage.removeItem("user-auth");
      this.props.navigation.navigate("login");
    } else {
      this.setState({ activity: false });
      alert("Unable to log out");
    }
  };
  componentDidMount = async () => {
    let authUser = await AsyncStorage.getItem("user-auth");
    if (authUser) {
      authUser = JSON.parse(authUser);
      this.setState({
        id: authUser.id,
        name: authUser.name,
        token: authUser.token
      });
      this.props.navigation.setParams({ name: authUser.name });
    } else {
      const userAuth = {
        id: this.state.id,
        name: this.state.name,
        token: this.state.token
      };
      await AsyncStorage.setItem("user-auth", JSON.stringify(userAuth));
    }
    Notifications.addListener(notification => {
      console.log("New notification", notification);
      this.props.navigation.navigate("ChatScreen", {
        roomName: notification.data.roomName,
        roomId: notification.data.roomId,
        id: this.state.id,
        name: this.state.name,
        creator: "*&push"
      });
    });
    await this.getRoomsLocal();
    const chatManager = new ChatManager({
      instanceLocator: credentials.INSTANCE_LOCATOR,
      userId: this.state.id,
      tokenProvider: new TokenProvider({
        url: credentials.SERVER_URL + "/tokenProvider"
      })
    });
    const currentUser = await chatManager.connect({
      onAddedToRoom: room => {
        this.setState({ rooms: [...this.state.rooms, room] });
        Alert.alert(
          "Added to new Room",
          "You are added to the room: " + room.name,
          [
            {
              text: "Switch to the room",
              onPress: () =>
                this.props.navigation.navigate("ChatScreen", {
                  roomName: room.name,
                  roomId: room.id,
                  id: this.state.id,
                  name: this.state.name,
                  creator: room.created_by_id
                })
            },
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            }
          ],
          { cancelable: false }
        );
      },
      onRemovedFromRoom: removedRoom => {
        this.setState({
          rooms: this.state.rooms.filter(room => room.id !== removedRoom.id)
        });
        alert("You are removed from room: " + removedRoom.name);
      },
      onRoomDeleted: deletedRoom => {
        this.setState({
          rooms: this.state.rooms.filter(room => room.id !== deletedRoom.id)
        });
        alert("Deleted room: " + deletedRoom.name);
      },
      onRoomUpdated: updatedRoom => {
        this.setState({
          rooms: this.state.rooms.map(room => {
            if (room.id === updatedRoom.id) {
              return updatedRoom;
            } else return room;
          })
        });
      }
    });
    this.setState({ currentUser });
    this.focusEvent = this.props.navigation.addListener("willFocus", () => {
      this.getRoomsLocal();
    });
    await this.getRooms();
    await AsyncStorage.setItem(
      "rooms-" + this.state.id,
      JSON.stringify(this.state.rooms)
    );
  };
  refresh = async () => {
    await this.getRoomsLocal();
    this.getRooms();
  };
  componentWillUnmount = () => {
    this.focusEvent && this.focusEvent.remove();
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
          keyExtractor={(item, index) => "" + index}
          data={this.state.rooms}
          renderItem={({ item }) => (
            <Room
              item={item}
              userId={this.state.id}
              name={this.state.name}
              navigation={this.props.navigation}
              refresh={this.refresh}
            />
          )}
        />
        <Prompt
          title={this.state.prompt.title}
          placeholder={this.state.prompt.placeholder}
          visible={this.state.promptVisible}
          onSubmit={value => this.state.prompt.onSubmit(value)}
          onCancel={this.state.prompt.onCancel}
          textInputProps={{
            autoCapitalize: "none"
          }}
        />
        <ActionButton
          buttonColor="rgba(120,120,120,0.8)"
          renderIcon={active => {
            if (active)
              return <Icon.Ionicons name="md-add" size={30} color="#fff" />;
            else return <Icon.Ionicons name="md-menu" size={30} color="#fff" />;
          }}
        >
          <ActionButton.Item
            buttonColor="#9b59b6"
            title="Create New Room"
            onPress={() => this.showPrompt("New Room")}
          >
            <Icon.Ionicons
              name="md-add-circle"
              size={30}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#3498db"
            title="Join A Room"
            onPress={() => {
              this.props.navigation.navigate("JoinRooms", {
                id: this.state.id,
                access_token: this.state.access_token,
                name: this.state.name
              });
            }}
          >
            <Icon.Ionicons
              name="md-chatbubbles"
              size={30}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#1abc9c"
            title="Private Chat with a new User"
            onPress={() => {
              this.showPrompt("Private Chat with a new User");
            }}
          >
            <Icon.Ionicons
              name="md-person-add"
              size={30}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#2020a0"
            title="Refresh"
            onPress={() => this.refresh()}
          >
            <Icon.Ionicons
              name="md-refresh-circle"
              size={30}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#770000"
            title="Log out"
            onPress={() => this.signOut()}
          >
            <Icon.Ionicons
              name="md-exit"
              size={30}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
        </ActionButton>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  roomContainer: {
    flex: 0,
    padding: 18,
    backgroundColor: "#eef",
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: "grey"
  },
  txt: {
    fontSize: 18,
    color: "#235",
    fontWeight: "bold"
  },
  actionButtonIcon: {
    color: "#fff"
  }
});
export default Rooms;
