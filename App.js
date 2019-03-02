import React from "react";
import {
  createStackNavigator,
  createAppContainer,
  createSwitchNavigator,
  createBottomTabNavigator
} from "react-navigation";
import { AsyncStorage } from "react-native";
import { AppLoading, Asset } from "expo";
import ChatScreen from "./Screens/Chatscreen";
import Rooms from "./Screens/Rooms";
import JoinRooms from "./Screens/JoinRooms";
import SignUpScreen from "./Screens/SignUpScreen";
import SignInScreen from "./Screens/SignInScreen";
const Screens = createStackNavigator(
  {
    Rooms: { screen: Rooms },
    JoinRooms: { screen: JoinRooms },
    ChatScreen: { screen: ChatScreen }
  },
  {
    initialRouteName: "Rooms"
  }
);
const login = createBottomTabNavigator(
  {
    SignUpScreen: SignUpScreen,
    SignInScreen: SignInScreen
  },
  {
    initialRouteName: "SignUpScreen",
    lazy: true,
    activeTintColor: "#237"
  }
);
export default class App extends React.Component {
  scroll = null;
  state = {
    AppContainer: null
  };
  _loadResourcesAsync = async () => {
    return Promise.all([Asset.loadAsync([require("./assets/icon.png")])]);
  };

  _handleLoadingError = error => {
    console.warn(error);
  };

  _handleFinishLoading = async () => {
    const loggedIn = await AsyncStorage.getItem("user-auth");
    let initailScreen = "login";
    if (loggedIn) {
      initailScreen = "Screens";
    }
    const SignUp = createSwitchNavigator(
      {
        login: login,
        Screens: Screens
      },
      {
        initialRouteName: initailScreen
      }
    );
    this.setState({ AppContainer: createAppContainer(SignUp) });
  };
  componentDidMount = async () => {
    const loggedIn = await AsyncStorage.getItem("user-auth");
    this.setState({ loggedIn });
  };
  render() {
    return this.state.AppContainer ? (
      <this.state.AppContainer />
    ) : (
      <AppLoading
        startAsync={this._loadResourcesAsync}
        onError={this._handleLoadingError}
        onFinish={this._handleFinishLoading}
      />
    );
  }
}
