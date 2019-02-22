import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "expo";
import TitleBar from "../Components/TitleBar";
import StyledBtn from "../Components/StyledBtn";
import StyledInput from "../Components/StyledInput";
import credentials from "../credentials";
import requestApi from "../requestApi";
export default class SignUpScreen extends React.Component {
  static navigationOptions = {
    header: "Sign In"
  };
  state = {
    username: "",
    password: "",
    activity: false
  };
  signinAction = async () => {
    const { username, password } = this.state;
    if (!username) alert("Username must not be empty");
    else if (!password) alert("Password must not be empty");
    else {
      this.setState({ activity: true });
      const data = {
        instanceLocator: credentials.INSTANCE_LOCATOR,
        key: credentials.SECRET_KEY,
        id: username,
        password: password
      };
      const url = credentials.SERVER_URL + "/signin";
      const response = await requestApi(url, data);
      const result = await response.json();
      this.setState({ activity: false });
      if (response.ok) this.props.navigation.navigate("Rooms", result);
      else alert(response.status);
    }
  };
  render() {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        alignItems: "center"
      }
    });
    return (
      <View style={styles.container}>
        <TitleBar />
        <StyledInput
          bgColor="#ffd"
          placeholder="Enter Username"
          autoCapitalize="none"
          onChangeText={username => this.setState({ username })}
          icon={<Icon.FontAwesome name="user-circle" size={25} />}
        />
        <StyledInput
          bgColor="#ffd"
          placeholder="Enter Password"
          onChangeText={password => this.setState({ password })}
          icon={<Icon.MaterialIcons name="lock" size={25} />}
          secureTextEntry={true}
        />
        <StyledBtn
          bgcolor="#349"
          txtColor="#fff"
          activity={this.state.activity}
          title={this.state.activity ? "Please wait..." : "Sign In"}
          onPress={this.signinAction}
          width={180}
        />
      </View>
    );
  }
}
