import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator
} from "react-native";
import PropTypes from "prop-types";
export default class StyledBtn extends React.Component {
  render() {
    const styles = StyleSheet.create({
      btn: {
        marginLeft: 6,
        backgroundColor: "#373",
        padding: 6,
        borderRadius: 6,
        borderColor: "#141",
        borderWidth: 1
      },
      txt: {
        paddingLeft: 4,
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 17
      }
    });

    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={[
          styles.btn,
          { backgroundColor: this.props.bgcolor, minWidth: this.props.width }
        ]}
      >
        {this.props.activity && (
          <ActivityIndicator color={this.props.txtColor} size="small" />
        )}
        {this.props.icon}
        <Text style={[styles.txt, { color: this.props.txtColor }]}>
          {this.props.title}
        </Text>
      </TouchableOpacity>
    );
  }
}
StyledBtn.propTypes = {
  bgcolor: PropTypes.string,
  txtColor: PropTypes.string,
  activity: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func
};
StyledBtn.defaultProps = {
  title: "Invalid button",
  onPress: null
};
