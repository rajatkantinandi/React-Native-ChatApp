import React from "react";
import {
  createStackNavigator,
  createAppContainer,
  createSwitchNavigator,
  createBottomTabNavigator
} from "react-navigation";
import { AsyncStorage, Platform } from "react-native";
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
    initialRouteName: "Rooms",
    headerMode: "float",
    defaultNavigationOptions: {
      headerTitleStyle: {
        height: 40,
        marginTop: 5
      },
      headerStyle: {
        height: Platform.OS === 'ios' ? 35 : 50,
        backgroundColor: "#227",
        marginTop: Platform.OS === 'ios' ? 5 : -25,
      },
      headerTintColor: "#fff"
    }
  }
);
const login = createBottomTabNavigator(
  {
    SignUpScreen: SignUpScreen,
    SignInScreen: SignInScreen
  },
  {
    initialRouteName: "SignUpScreen",
    tabBarOptions: {
      lazy: true,
      activeTintColor: "#237",
      labelStyle: {
        fontSize: 15,
        fontWeight: "bold"
      },
      activeBackgroundColor: "#ccf",
      inactiveTintColor: "#ccc"
    }
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
    let initialScreen = "login";
    if (loggedIn) {
      initialScreen = "Screens";
    }
    const SignUp = createSwitchNavigator(
      {
        login: login,
        Screens: Screens
      },
      {
        initialRouteName: initialScreen
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
