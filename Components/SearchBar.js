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
    paddingLeft: 10,
    paddingBottom: 8,
    paddingTop: 8,
    flex: 0,
    flexDirection: "row",
    zIndex: 2,
  },
  txt: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    width: "85%",
    height: 45,
    borderRadius: 22,
    fontSize: 18,
    backgroundColor: 'white',
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  icon: {
    padding: 5,
    paddingRight: 8,
  }
});
