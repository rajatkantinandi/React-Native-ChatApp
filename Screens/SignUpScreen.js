import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Icon } from "expo";
import TitleBar from "../Components/TitleBar";
import StyledBtn from "../Components/StyledBtn";
import StyledInput from "../Components/StyledInput";
import credentials from "../credentials";
import requestApi from "../requestApi";

export default class SignUpScreen extends React.Component {
  static navigationOptions = {
    header: "Sign Up"
  };
  state = {
    name: "",
    username: "",
    password: "",
    repeatPassword: "",
    activity: false,
    validUserName: false
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
      const url = credentials.SERVER_URL + "/register";
      const data = {
        instanceLocator: credentials.INSTANCE_LOCATOR,
        key: credentials.SECRET_KEY,
        id: username,
        name: name,
        password: password
      };
      const response = await requestApi(url, data);
      const result = await response.json();
      if (response.ok) this.props.navigation.navigate("Rooms", result);
      else alert(response.statusText);
      this.setState({ activity: false });
    }
  };
  validateUser = async username => {
    this.setState({ username });
    if (username.length < 5) {
      this.setState({ validUserName: false });
    } else this.setState({ validUserName: true });
  };
  render() {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
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
      <View style={styles.container}>
        <TitleBar />
        <StyledInput
          bgColor="#ffd"
          placeholder="Enter Your Name"
          autoCapitalize="none"
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
            style={[styles.hint, { color: "green", backgroundColor: "white" }]}
          >
            ✅ Username Available
          </Text>
        ) : (
          <Text
            style={[styles.hint, { color: "#a22", backgroundColor: "#fef" }]}
          >
            x Username Unvailable
          </Text>
        )}
        <StyledInput
          bgColor="#ffd"
          placeholder="Choose a Password"
          onChangeText={password => this.setState({ password })}
          icon={<Icon.MaterialIcons name="lock" size={25} />}
          secureTextEntry={true}
        />
        <Text style={styles.hint}>
          ** Password must be atleast 8 chars long & have only letters & numbers
        </Text>
        <StyledInput
          bgColor="#ffd"
          placeholder="Repeat Password"
          onChangeText={repeatPassword => this.setState({ repeatPassword })}
          icon={<Icon.MaterialIcons name="lock" size={25} />}
          secureTextEntry={true}
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
    );
  }
}
