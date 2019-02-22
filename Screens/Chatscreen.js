import React from "react";
import {
  KeyboardAvoidingView,
  FlatList,
  StyleSheet,
  AsyncStorage
} from "react-native";
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
    const url = credentials.SERVER_URL + "/sendMessage";
    const data = {
      instanceLocator: credentials.INSTANCE_LOCATOR,
      key: credentials.SECRET_KEY,
      roomId: this.state.roomId,
      id: this.state.id,
      text: text
    };
    this.setState({
      messages: [...this.state.messages, { user_id: this.state.id, text: text }]
    });
    const response = await requestApi(url, data);
    const result = await response.json();
    if (response.ok) alert("Message id: " + result.messageId);
    else alert(response.statusTxt);
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={80}
        enabled
      >
        <FlatList
          data={[...this.state.messages].reverse()}
          renderItem={({ item }) => (
            <Message
              from={item.user_id}
              text={item.text}
              sent={item.user_id === this.state.id}
            />
          )}
          keyExtractor={this._keyExtractor}
          style={styles.page}
          inverted
        />
        <InputArea onSend={text => this.sendMessage(text)} />
      </KeyboardAvoidingView>
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
    zIndex: 1,
    height: 100
  }
});
export default Chatscreen;
