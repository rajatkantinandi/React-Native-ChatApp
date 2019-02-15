import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
export default class Message extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const finalStyle = this.props.sent ? styles2 : styles;
    return (
      <TouchableOpacity style={finalStyle.container}>
        <Text style={finalStyle.from}>{this.props.from}</Text>
        <Text style={finalStyle.text}>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 0,
    padding: 8,
    margin: 5,
    backgroundColor: "#22AA00",
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    width: "75%"
  },
  from: {
    color: "#ff9",
    fontWeight: "bold",
    fontSize: 20
  },
  text: {
    color: "#fff",
    fontSize: 15
  }
});
const styles2 = StyleSheet.create({
  container: {
    flex: 0,
    padding: 8,
    margin: 5,
    marginLeft: "25%",
    backgroundColor: "#AA2200",
    borderRadius: 10,
    borderBottomRightRadius: 0,
    width: "75%"
  },
  from: {
    color: "#9ff",
    fontWeight: "bold",
    fontSize: 20
  },
  text: {
    color: "#fff",
    fontSize: 15
  }
});
