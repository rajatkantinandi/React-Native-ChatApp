import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "expo";
export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    text: ""
  };
  handleChange = text => {
    this.setState({ text });
    this.props.filter(text);
  };
  render() {
    return (
      <View style={styles.container}>
        <Icon.Ionicons
          name="md-search"
          size={35}
          color="black"
          style={styles.icon}
        />
        <TextInput
          placeholder="Filter room..."
          onChangeText={text => this.handleChange(text)}
          style={styles.txt}
          value={this.state.text}
        />
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
    width: "80%",
    height: 60,
    borderRadius: 20,
    borderColor: "#225",
    borderWidth: 3
  },
  icon: {
    padding: 10
  }
});
