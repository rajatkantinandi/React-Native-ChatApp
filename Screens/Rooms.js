import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
class Rooms extends React.Component {
  static navigationOptions = {
    title: "Rooms"
  };
  state = {
    rooms: [{ id: 123, name: "R1" }, { id: 255, name: "R2" }]
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
                  roomId: room.name
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
