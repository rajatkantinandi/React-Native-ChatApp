import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  FlatList
} from "react-native";
import credentials from "../credentials";
import requestApi from "../requestApi";
import { ChatManager, TokenProvider } from "@pusher/chatkit-client";
class Rooms extends React.Component {
  static navigationOptions = {
    title: "Joinable Rooms"
  };
  state = {
    id: this.props.navigation.getParam("id"),
    name: this.props.navigation.getParam("name"),
    rooms: [],
    access_token: this.props.navigation.getParam("access_token"),
    currentUser: null
  };
  getRoomsLocal = async () => {
    let rooms = await AsyncStorage.getItem("joinableRooms-" + this.state.id);
    if (rooms) this.setState({ rooms: JSON.parse(rooms) });
  };
  getRooms = async () => {
    const url = credentials.SERVER_URL + "/getUserJoinableRooms";
    const data = {
      instanceLocator: credentials.INSTANCE_LOCATOR,
      key: credentials.SECRET_KEY,
      id: this.state.id
    };
    const response = await requestApi(url, data);
    const result = await response.json();
    if (response.ok) this.setState({ rooms: result });
    else alert(result);
  };
  joinRoom = async (roomId, name) => {
    if (this.state.currentUser) {
      await this.state.currentUser.joinRoom({ roomId: roomId });
      try {
        await this.setState({
          rooms: this.state.rooms.filter(room => room.id !== roomId)
        });
        await AsyncStorage.setItem(
          "joinableRooms-" + this.state.id,
          JSON.stringify(this.state.rooms)
        );
        this.props.navigation.goBack();
      } catch (err) {
        console.log(`Error joining room ${name}: ${err}`);
      }
    }
  };
  componentDidMount = async () => {
    await this.getRoomsLocal();
    const chatManager = new ChatManager({
      instanceLocator: credentials.INSTANCE_LOCATOR,
      userId: this.state.id,
      tokenProvider: new TokenProvider({
        url: credentials.SERVER_URL + "/tokenProvider"
      })
    });
    const currentUser = await chatManager.connect();
    await this.setState({ currentUser });
    await this.getRooms();
    await AsyncStorage.setItem(
      "joinableRooms-" + this.state.id,
      JSON.stringify(this.state.rooms)
    );
  };
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          keyExtractor={(item, index) => "" + index}
          data={this.state.rooms}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              style={styles.roomContainer}
              onPress={() => this.joinRoom(item.id, item.name)}
            >
              <Text style={styles.txt}>#{item.name}</Text>
            </TouchableOpacity>
          )}
        />
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
    padding: 20,
    backgroundColor: "#ddf",
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: "grey"
  },
  txt: {
    fontSize: 20,
    color: "maroon"
  },
  actionButtonIcon: {
    color: "#fff"
  }
});
export default Rooms;
