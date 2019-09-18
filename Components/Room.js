import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  AsyncStorage,
  View
} from "react-native";
export default class Room extends React.Component {
  state = {
    lastMsg: null
  };

  mounted = true;

  getLastMessage = async () => {
    let messages = await AsyncStorage.getItem("room:" + this.props.item.id);
    messages = JSON.parse(messages);
    const lastMsg =
      messages && messages.length > 0 ? messages[messages.length - 1] : null;
    if (this.mounted) {
      await this.setState({ lastMsg });
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

  componentDidMount = async () => {
    await this.getLastMessage();
  };

  componentWillReceiveProps = async nextProps => {
    await this.getLastMessage();
  };

  componentWillUnmount() {
    this.mounted = false;
  }


  render() {
    const { item, userId, name, navigation } = this.props;
    return (
      <TouchableOpacity
        style={styles.roomContainer}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            roomName: item.name,
            roomId: item.id,
            id: userId,
            name: name,
            creator: item.created_by_id
          })}
      >
        <View style={styles.heading}>
          <Text style={styles.txt}>#{item.name}</Text>
          <Text style={styles.msg}>
            {this.state.lastMsg ? (
              " on " + this.parseDate(this.state.lastMsg.created_at)
            ) : (
                ""
              )}
          </Text>
        </View>
        <Text
          style={
            this.props.newMsg ? (
              { color: "green", fontWeight: "bold" }
            ) : (
                styles.msg
              )
          }
        >
          {this.state.lastMsg &&
            this.state.lastMsg.user_id + ": " + this.state.lastMsg.text}
        </Text>
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  roomContainer: {
    flex: 0,
    padding: 10,
    paddingTop: 6,
    backgroundColor: 'rgba(240,240,250,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 4,
  },
  txt: {
    fontSize: 18,
    color: "#235",
    fontWeight: "bold"
  },
  heading: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  msg: {
    fontSize: 14,
    color: "#779",
    padding: 3,
    paddingLeft: 10
  }
});
