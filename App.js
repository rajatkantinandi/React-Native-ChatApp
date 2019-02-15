import React from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";
import ChatScreen from "./Screens/Chatscreen";
import Rooms from "./Screens/Rooms";
import credentials from "./credentials";
const Screens = createStackNavigator(
  {
    Rooms: { screen: Rooms },
    ChatScreen: { screen: ChatScreen }
  },
  {
    initialRouteName: "Rooms"
  }
);
const AppContainer = createAppContainer(Screens);
export default class App extends React.Component {
  scroll = null;
  state = {};
  render() {
    return <AppContainer />;
  }
}
