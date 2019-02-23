import React from "react";
import { View, FlatList, StyleSheet, AsyncStorage } from "react-native";
import Message from "../Components/Message";
import InputArea from "../Components/InputArea";
import credentials from "../credentials";
import requestApi from "../requestApi";
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
    roomName: this.props.navigation.getParam("roomName") | "Default",
    roomId: this.props.navigation.getParam("roomId"),
    activity: true
  };
  _keyExtractor = (item, index) => "" + index;
  componentDidMount = async () => {
    await this.getAllMessagesLocal();
    await this.getAllMessages();
  };
  componentDidUpdate = async () => {
    await AsyncStorage.setItem(
      "room:" + this.state.roomId,
      JSON.stringify(this.state.messages)
    );
  };
  sendMessage = async text => {
    const url =
      credentials.CHATKIT_API + "/rooms/" + this.state.roomId + "/messages";
    const data = {
      text: text
    };
    this.setState({
      messages: [...this.state.messages, { user_id: this.state.id, text: text }]
    });
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization:
          "Bearer " + this.props.navigation.getParam("access_token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
      let messages = this.state.messages;
      let newMsg = messages.pop();
      newMsg.id = result.message_id;
      messages.push(newMsg);
      this.setState({ messages });
    } else alert(response.statusTxt);
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
    const data = {
      instanceLocator: credentials.INSTANCE_LOCATOR,
      key: credentials.SECRET_KEY,
      roomId: this.state.roomId
    };
    const response = await requestApi(url, data);
    const result = await response.json();
    if (response.ok) this.setState({ messages: result });
    else alert(response.statusTxt);
    this.setState({ activity: false });
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
        <InputArea onSend={text => this.sendMessage(text)} />
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
