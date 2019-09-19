import React from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  View,
  Platform,
} from "react-native";
import { Icon, Permissions, Notifications } from "expo";
import TitleBar from "../Components/TitleBar";
import StyledBtn from "../Components/StyledBtn";
import StyledInput from "../Components/StyledInput";
import PasswordInput from "../Components/PasswordInput";
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
    availability: "x Username must be atleast 5 chars"
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
    let token = "";
    try {
      token = await Notifications.getExpoPushTokenAsync();
    } catch (err) {
      alert("Push Notifications disabled");
    }
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
      } else alert(response._bodyText);
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
      await this.setState({
        validUserName: false,
        availability: "x Username must be atleast 5 chars !!"
      });
    } else if (response.ok) await this.setState({ validUserName: true });
    else {
      await this.setState({
        validUserName: false,
        availability: "x Username unavailable !!"
      });
    }
  };
  render() {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        height: '100%',
        alignItems: "center",
      },
      hint: {
        fontSize: 15,
        fontWeight: "bold",
        textAlign: "center",
        margin: 2,
        padding: 2
      },
      iosNotchPadding: {
        height: 40,
        backgroundColor: '#222265',
        width: '100%',
      }
    });
    return (
      <ScrollView style={{ backgroundColor: "#eef" }}>
        <KeyboardAvoidingView
          enabled
          behavior="position"
          keyboardVerticalOffset={30}
        >
          {Platform.OS === 'ios' && <View style={styles.iosNotchPadding} />}
          <TitleBar />
          <View style={styles.container}>
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
                  style={[
                    styles.hint,
                    { color: "#a22", backgroundColor: "#fef" }
                  ]}
                >
                  {this.state.availability}
                </Text>
              )}
            <PasswordInput
              bgColor="#ffd"
              placeholder="Choose a Password"
              onChangeText={password => this.setState({ password })}
              autoCapitalize="none"
            />
            <Text style={styles.hint}>
              ** Password must be atleast 8 chars long & have only letters &
              numbers
            </Text>
            <PasswordInput
              bgColor="#ffd"
              placeholder="Repeat Password"
              onChangeText={repeatPassword => this.setState({ repeatPassword })}
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
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}
