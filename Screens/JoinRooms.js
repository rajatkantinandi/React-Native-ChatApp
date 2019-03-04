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
import SearchBar from "../Components/SearchBar";
import { ChatManager, TokenProvider } from "@pusher/chatkit-client";
class Rooms extends React.Component {
  static navigationOptions = {
    title: "Joinable Rooms"
  };
  state = {
    id: this.props.navigation.getParam("id"),
    name: this.props.navigation.getParam("name"),
    rooms: [],
    filteredRooms: [],
    filterText: "",
    access_token: this.props.navigation.getParam("access_token"),
    currentUser: null,
    activity: false,
    loading: true
  };
  getRoomsLocal = async () => {
    let rooms = await AsyncStorage.getItem("joinableRooms-" + this.state.id);
    if (rooms && this.mounted)
      this.setState({
        rooms: JSON.parse(rooms),
        filteredRooms: this.filter(JSON.parse(rooms))
      });
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
      this.setState({
        rooms: result,
        loading: false,
        filteredRooms: this.filter(result)
      });
    else alert(result);
  };
  joinRoom = async (roomId, name) => {
    if (this.state.currentUser) {
      this.setState({ activity: true });
      await this.state.currentUser.joinRoom({ roomId: roomId });
      try {
        await this.setState({
          rooms: this.state.rooms.filter(room => room.id !== roomId),
          activity: false,
          filteredRooms: this.state.filteredRooms.filter(
            room => room.id !== roomId
          )
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
  filter = rooms => {
    if (this.state.filterText !== "") {
      const regex = new RegExp(this.state.filterText, "gi");
      return rooms.filter(room => regex.test(room.name));
    } else return rooms;
  };
  componentDidMount = async () => {
    this.mounted = true;
    await this.getRoomsLocal();
    const chatManager = new ChatManager({
      instanceLocator: credentials.INSTANCE_LOCATOR,
      userId: this.state.id,
      tokenProvider: new TokenProvider({
        url: credentials.TOKEN_PROVIDER_URL
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
          style={styles.list}
          keyExtractor={(item, index) => "" + index}
          data={this.state.filteredRooms}
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
        <SearchBar
          filter={async text => {
            await this.setState({ filterText: text });
            this.setState({ filteredRooms: this.filter(this.state.rooms) });
          }}
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
  },
  list: {
    flex: 1
  }
});
export default Rooms;
