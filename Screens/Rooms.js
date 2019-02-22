import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  AsyncStorage
} from "react-native";
import credentials from "../credentials";
import requestApi from "../requestApi";
class Rooms extends React.Component {
  static navigationOptions = {
    title: "Rooms"
  };
  state = {
    id: this.props.navigation.getParam("id"),
    name: this.props.navigation.getParam("name"),
    rooms: [],
    access_token: null
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
    const response = await requestApi(url, data);
    const result = await response.json();
    if (response.ok) this.setState({ rooms: result });
    else alert(result);
  };
  getAuth = async () => {
    const url = credentials.SERVER_URL + "/auth";
    const data = {
      instanceLocator: credentials.INSTANCE_LOCATOR,
      key: credentials.SECRET_KEY,
      id: this.state.id
    };
    const response = await requestApi(url, data);
    const result = await response.json();
    if (response.ok) this.setState({ access_token: result.access_token });
    else alert(result);
  };
  componentDidMount = async () => {
    let authUser = await AsyncStorage.getItem("user-auth");
    if (authUser) {
      authUser = JSON.parse(authUser);
      this.setState({ id: authUser.id, name: authUser.name });
    } else {
      await this.getAuth();
      const userAuth = {
        id: this.state.id,
        name: this.state.name,
        access_token: this.state.access_token
      };
      await AsyncStorage.setItem("user-auth", JSON.stringify(userAuth));
    }
    await this.getRoomsLocal();
    if (this.state.rooms.length == 0) {
      await this.getRooms();
      await AsyncStorage.setItem(
        "rooms-" + this.state.id,
        JSON.stringify(this.state.rooms)
      );
    }
  };
  render() {
    return (
      <View>
        {this.state.rooms.map(room => {
          return (
            <TouchableOpacity
              key={room.id}
              style={styles.roomContainer}
              onPress={() =>
                this.props.navigation.navigate("ChatScreen", {
                  roomName: room.name,
                  roomId: room.id,
                  id: this.state.id,
                  name: this.state.name,
                  access_token: this.state.access_token
                })
              }
            >
              <Text style={styles.txt}>#{room.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}
const styles = StyleSheet.create({
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
  }
});
export default Rooms;
