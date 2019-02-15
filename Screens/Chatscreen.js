import React from "react";
import {
  KeyboardAvoidingView,
  FlatList,
  StyleSheet,
  Keyboard
} from "react-native";
import Message from "../Components/Message";
import InputArea from "../Components/InputArea";
class Chatscreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("roomId", "Default")
    };
  };
  state = {
    messages: [
      { from: "George", text: "Hey Everyone !!", sent: false },
      {
        from: "George",
        text:
          "This is George from the future. If you can give me some nuclear fuel then I can recharge my time machine & head back to my time.",
        sent: false
      },
      { from: "Rajat", text: "Maybe I can help you", sent: true }
    ],
    roomName: this.props.navigation.roomId | "Default",
    roomId: this.props.navigation.roomName
  };
  _keyExtractor = (item, index) => "" + index;
  componentDidMount = () => {
    // Keyboard.addListener("keyboardDidShow", e =>
    //   this.scroll.scrollToEnd({ animated: false })
    // );
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
            <Message from={item.from} text={item.text} sent={item.sent} />
          )}
          keyExtractor={this._keyExtractor}
          style={styles.page}
          inverted
        />
        <InputArea
          onSend={text => {
            this.setState({
              messages: [
                ...this.state.messages,
                { from: "Rajat", text: text, sent: true }
              ]
            });
          }}
        />
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
