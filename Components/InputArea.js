import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "expo";
export default class InputArea extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    text: ""
  };
  onSend = () => {
    this.props.onSend(this.state.text);
    this.setState({ text: "" });
  };
  render() {
    return (
      <View style={styles.container}>
        <TextInput
          placeholder="Type something..."
          onChangeText={text => this.setState({ text })}
          style={styles.txt}
          value={this.state.text}
        />
        <TouchableOpacity style={styles.sendbtn} onPress={this.onSend}>
          <Icon.Ionicons name="md-send" size={35} color="white" />
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    margin: 10,
    flex: 0,
    flexDirection: "row",
    zIndex: 10
  },
  txt: {
    padding: 10,
    width: "85%",
    height: 60,
    borderRadius: 20,
    borderColor: "#225",
    borderWidth: 3
  },
  sendbtn: {
    backgroundColor: "#229911",
    width: 60,
    height: 60,
    paddingLeft: 20,
    paddingTop: 10,
    borderRadius: 30,
    marginLeft: 5
  },
  btntxt: {
    color: "#fff",
    fontSize: 18
  }
});
