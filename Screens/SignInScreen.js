import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Permissions, Notifications } from "expo";
import TitleBar from "../Components/TitleBar";
import StyledBtn from "../Components/StyledBtn";
import StyledInput from "../Components/StyledInput";
import credentials from "../credentials";
import requestApi from "../requestApi";
export default class SignInScreen extends React.Component {
  static navigationOptions = {
    header: "Sign In"
  };
  state = {
    username: "",
    password: "",
    activity: false
  };
  getNotificationToken = async () => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== "granted") {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== "granted") {
      return null;
    }

    // Get the token that uniquely identifies this device
    // let token = await Notifications.getExpoPushTokenAsync();
    return "Expo token 3";
  };
  signinAction = async () => {
    const { username, password } = this.state;
    if (!username) alert("Username must not be empty");
    else if (!password) alert("Password must not be empty");
    else {
      this.setState({ activity: true });
      const token = await this.getNotificationToken();
      console.log(token);
      const data = {
        instanceLocator: credentials.INSTANCE_LOCATOR,
        key: credentials.SECRET_KEY,
        id: username,
        password: password,
        token
      };
      const url = credentials.SERVER_URL + "/signin";
      const response = await requestApi(url, data);
      const result = await response.json();
      this.setState({ activity: false });
      if (response.ok)
        this.props.navigation.navigate("Rooms", { ...result, token });
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
