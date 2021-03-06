import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Clipboard,
  ToastAndroid,
  Platform,
} from "react-native";
import { Icon } from "expo";
export default class Message extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const finalStyle = this.props.sent ? styles2 : styles;
    return (
      <View style={finalStyle.outer}>
        <TouchableOpacity
          style={finalStyle.container}
          onLongPress={() => {
            Clipboard.setString(this.props.text);
            if (Platform.OS === 'android') {
              ToastAndroid.show(
                "Copied to Clipboard",
                ToastAndroid.LONG,
                ToastAndroid.CENTER
              );
            }
            else {
              alert('Copied to Clipboard');
            }
          }}
        >
          <View style={styles.heading}>
            <Text style={finalStyle.from} numberOfLines={1}>{this.props.from}</Text>
            <Text style={finalStyle.dateText}>
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
    backgroundColor: "#dfd",
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    width: "93%",
    shadowColor: '#2a2',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  heading: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  from: {
    color: "#191",
    fontWeight: "bold",
    fontSize: 20,
    width: '45%',
    overflow: 'hidden',
  },
  text: {
    color: "#111",
    fontSize: 15,
  },
  dateText: {
    color: "rgba(0,0,0,0.7)",
    fontSize: 15,
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
    backgroundColor: "#529",
    borderRadius: 10,
    borderBottomRightRadius: 0,
    width: "93%",
    shadowColor: '#315',
    shadowOffset: { width: -2, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  from: {
    color: "#9ff",
    fontWeight: "bold",
    fontSize: 20,
    width: '45%',
    overflow: 'hidden',
  },
  text: {
    color: "#fff",
    fontSize: 15
  },
  dateText: {
    color: "rgba(250,250,250,0.7)",
    fontSize: 15,
  },
});
