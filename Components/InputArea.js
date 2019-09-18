import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from "react-native";
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
    let options = ["Add User to Room", "Rename this Room", "leave Room"];
    let actions = [
      this.props.addUser,
      this.props.renameRoom,
      this.props.leaveRoom,
    ];
    if (this.props.isCreator) {
      options.push("Delete Room");
      actions.push(this.props.deleteRoom);
    }
    if (Platform.OS === 'ios') {
      options.push('Cancel');
      actions.push(() => 0);
    }

    return (
      <View style={styles.container}>
        <OptionsMenu
          button={MenuIcon}
          buttonStyle={{
            width: 40,
            height: 35,
            resizeMode: "contain",
            borderRadius: 15,
            margin: 5,
          }}
          destructiveIndex={this.props.isCreator ? 3 : 2}
          options={options}
          actions={actions}
        />
        <TextInput
          placeholder="Type something..."
          onChangeText={text => this.setState({ text })}
          style={styles.txt}
          value={this.state.text}
        />
        <TouchableOpacity style={styles.sendbtn} onPress={this.onSend}>
          <Icon.Ionicons name="md-send" size={25} color="white" />
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingBottom: 8,
    paddingTop: 8,
    flex: 0,
    flexDirection: "row",
    zIndex: 10,
    backgroundColor: '#eef',
    width: '100%',
  },
  txt: {
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    width: "73%",
    height: 45,
    borderRadius: 22,
    fontSize: 18,
    backgroundColor: 'white',
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendbtn: {
    backgroundColor: "#229911",
    width: 40,
    height: 40,
    paddingLeft: 12,
    paddingTop: 8,
    borderRadius: 20,
    marginLeft: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  btntxt: {
    color: "#fff",
    fontSize: 18,
  }
});
