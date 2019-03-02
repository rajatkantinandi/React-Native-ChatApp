import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Icon } from "expo";
export default class Message extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const finalStyle = this.props.sent ? styles2 : styles;
    return (
      <View style={finalStyle.outer}>
        <TouchableOpacity style={finalStyle.container}>
          <View style={styles.heading}>
            <Text style={finalStyle.from}>{this.props.from}</Text>
            <Text style={finalStyle.text}>
              {this.props.at ? " on " + this.props.at : ""}
            </Text>
          </View>
          <Text style={finalStyle.text}>{this.props.text}</Text>
        </TouchableOpacity>
        {this.props.sent &&
          (this.props.posted ? (
            <Icon.FontAwesome name="check-circle" size={20} />
          ) : (
            <Icon.FontAwesome name="spinner" size={20} />
          ))}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  outer: {
    flex: 0,
    flexDirection: "row",
    margin: 5,
    width: "75%",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  container: {
    flex: 0,
    padding: 8,
    backgroundColor: "#22AA00",
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    width: "93%"
  },
  heading: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between"
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
  outer: {
    flex: 0,
    flexDirection: "row",
    margin: 5,
    marginLeft: "25%",
    width: "75%",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  container: {
    flex: 0,
    padding: 8,
    backgroundColor: "#AA2200",
    borderRadius: 10,
    borderBottomRightRadius: 0,
    width: "93%"
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
