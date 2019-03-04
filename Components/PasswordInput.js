import React from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Icon } from "expo";
import PropTypes from "prop-types";
export default class PasswordInput extends React.Component {
  state = {
    secureTextEntry: true,
    visibility: "visibility"
  };
  render() {
    const styles = StyleSheet.create({
      field: {
        flex: 0,
        flexDirection: "row",
        margin: 8,
        padding: 5,
        backgroundColor: "#fdf",
        borderRadius: 8,
        borderColor: "#223",
        borderWidth: 1
      },
      input: {
        width: 220,
        padding: 4,
        fontSize: 18,
        marginLeft: 4
      }
    });
    return (
      <View style={[styles.field, { backgroundColor: this.props.bgColor }]}>
        <Icon.MaterialIcons name="lock" size={25} />
        <TextInput
          style={[styles.input, { color: this.props.color }]}
          placeholder={this.props.placeholder}
          onChangeText={this.props.onChangeText}
          secureTextEntry={this.state.secureTextEntry}
          autoCapitalize={this.props.autoCapitalize}
        />
        <TouchableOpacity
          onPress={() =>
            this.setState({
              secureTextEntry: !this.state.secureTextEntry,
              visibility: this.state.secureTextEntry
                ? "visibility-off"
                : "visibility"
            })
          }
        >
          <Icon.MaterialIcons name={this.state.visibility} size={25} />
        </TouchableOpacity>
      </View>
    );
  }
}
PasswordInput.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  secureTextEntry: PropTypes.bool,
  autoCapitalize: PropTypes.string.isRequired
};
PasswordInput.defaultProps = {
  placeholder: "Type Something...",
  onChangeText: null,
  autoCapitalize: "sentences"
};
