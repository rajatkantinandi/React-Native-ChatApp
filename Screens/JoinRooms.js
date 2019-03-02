import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  FlatList,
  ProgressBarAndroid
} from "react-native";
import credentials from "../credentials";
import requestApi from "../requestApi";
import ProgressDialog from "../Components/ProgressDialog";
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
    currentUser: null,
    activity: false,
    loading: true
  };
  getRoomsLocal = async () => {
    let rooms = await AsyncStorage.getItem("joinableRooms-" + this.state.id);
    if (rooms && this.mounted) this.setState({ rooms: JSON.parse(rooms) });
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
    if (response.ok && this.mounted)
      this.setState({ rooms: result, loading: false });
    else alert(result);
  };
  joinRoom = async (roomId, name) => {
    if (this.state.currentUser) {
      this.setState({ activity: true });
      await this.state.currentUser.joinRoom({ roomId: roomId });
      try {
        await this.setState({
          rooms: this.state.rooms.filter(room => room.id !== roomId),
          activity: false
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
    this.mounted = true;
    await this.getRoomsLocal();
    const chatManager = new ChatManager({
      instanceLocator: credentials.INSTANCE_LOCATOR,
      userId: this.state.id,
      tokenProvider: new TokenProvider({
        url: credentials.SERVER_URL + "/tokenProvider"
      })
    });
    const currentUser = await chatManager.connect();
    if (this.mounted) await this.setState({ currentUser });
    if (this.mounted) await this.getRooms();
    await AsyncStorage.setItem(
      "joinableRooms-" + this.state.id,
      JSON.stringify(this.state.rooms)
    );
  };
  componentWillUnmount = () => {
    this.mounted = false;
  };
  render() {
    return (
      <View style={styles.container}>
        <ProgressDialog
          visible={this.state.activity}
          text="Adding you to the room.. Please Wait.."
        />
        {this.state.loading && <ProgressBarAndroid styleAttr="Horizontal" />}
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
  }
});
export default Rooms;
