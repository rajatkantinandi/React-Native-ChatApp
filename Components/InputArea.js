import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import OptionsMenu from "react-native-options-menu";
const MenuIcon = require("../assets/menu.png");
import { Icon } from "expo";
export default class InputArea extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    text: ""
  };
  onSend = () => {
    if (this.state.text === "") alert("Message can't be empty!");
    else {
      this.props.onSend(this.state.text);
      this.setState({ text: "" });
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <OptionsMenu
          button={MenuIcon}
          buttonStyle={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            backgroundColor: "#fff"
          }}
          destructiveIndex={1}
          options={["Add User to Room", "Rename this Room", "leave Room"]}
          actions={[
            this.props.addUser,
            this.props.renameRoom,
            this.props.leaveRoom
          ]}
        />
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
    width: "70%",
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
