import React from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  KeyboardAvoidingView
} from "react-native";
import { Icon, Permissions, Notifications } from "expo";
import TitleBar from "../Components/TitleBar";
import StyledBtn from "../Components/StyledBtn";
import StyledInput from "../Components/StyledInput";
import credentials from "../credentials";
import requestApi from "../requestApi";

export default class SignUpScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      tabBarLabel: "Sign Up",
      tabBarIcon: ({ tintColor }) => (
        <Icon.FontAwesome name="user-plus" size={25} color={tintColor} />
      )
    };
  };
  state = {
    name: "",
    username: "",
    password: "",
    repeatPassword: "",
    activity: false,
    validUserName: false,
    availability: "x Username Unvailable"
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
    let token = await Notifications.getExpoPushTokenAsync();
    return token;
  };
  signupAction = async () => {
    const {
      name,
      username,
      password,
      repeatPassword,
      validUserName
    } = this.state;
    if (!name) alert("Name must not be empty");
    else if (!username) alert("Username must not be empty");
    else if (username.length < 5)
      alert("username must be atleast 5 characters long");
    else if (!validUserName)
      alert("Username is not available please choose a different one");
    else if (!password) alert("Password must not be empty");
    else if (!password.match(/\w{8}\w*/))
      alert(
        "Password must be 8 characters long & should contain only letters & numbers"
      );
    else if (password !== repeatPassword) {
      alert("Passwords did not match!!");
    } else {
      this.setState({ activity: true });
      const token = await this.getNotificationToken();
      const url = credentials.SERVER_URL + "/register";
      const data = {
        instanceLocator: credentials.INSTANCE_LOCATOR,
        key: credentials.SECRET_KEY,
        id: username,
        name: name,
        password: password,
        token
      };
      const response = await requestApi(url, data);
      const result = await response.json();
      if (response.ok) {
        this.setState({ activity: false });
        this.props.navigation.navigate("Rooms", result);
      } else alert(response.statusText);
    }
  };
  validateUser = async username => {
    this.setState({
      username,
      availability: "Checking availability...",
      validUserName: false
    });
    const url = credentials.SERVER_URL + "/userAvailability";
    const data = {
      id: username,
      instanceLocator: credentials.INSTANCE_LOCATOR,
      key: credentials.SECRET_KEY
    };
    const response = await requestApi(url, data);
    if (username.length < 5) {
      this.setState({ validUserName: false });
    } else if (response.ok) this.setState({ validUserName: true });
  };
  render() {
    const styles = StyleSheet.create({
      container: {
        flex: 0,
        alignItems: "center"
      },
      hint: {
        fontSize: 15,
        fontWeight: "bold",
        textAlign: "center",
        margin: 2,
        padding: 2
      }
    });
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TitleBar />
        <KeyboardAvoidingView
          enabled
          behavior="height"
          style={styles.container}
        >
          <StyledInput
            bgColor="#ffd"
            placeholder="Enter Your Name"
            autoCapitalize="words"
            onChangeText={name => this.setState({ name })}
            icon={<Icon.FontAwesome name="user-circle" size={25} />}
          />
          <StyledInput
            bgColor="#ffd"
            placeholder="Choose an Username"
            autoCapitalize="none"
            onChangeText={async username => {
              await this.validateUser(username);
            }}
            icon={<Icon.FontAwesome name="user-circle" size={25} />}
          />
          {this.state.validUserName ? (
            <Text
              style={[
                styles.hint,
                { color: "green", backgroundColor: "white" }
              ]}
            >
              ✅ Username Available
            </Text>
          ) : (
            <Text
              style={[styles.hint, { color: "#a22", backgroundColor: "#fef" }]}
            >
              {this.state.availability}
            </Text>
          )}
          <StyledInput
            bgColor="#ffd"
            placeholder="Choose a Password"
            onChangeText={password => this.setState({ password })}
            icon={<Icon.MaterialIcons name="lock" size={25} />}
            secureTextEntry={true}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            ** Password must be atleast 8 chars long & have only letters &
            numbers
          </Text>
          <StyledInput
            bgColor="#ffd"
            placeholder="Repeat Password"
            onChangeText={repeatPassword => this.setState({ repeatPassword })}
            icon={<Icon.MaterialIcons name="lock" size={25} />}
            secureTextEntry={true}
            autoCapitalize="none"
          />
          <StyledBtn
            bgcolor="#394"
            txtColor="#fff"
            activity={this.state.activity}
            title={this.state.activity ? "Please wait..." : "Sign Up"}
            onPress={this.signupAction}
            width={180}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}
