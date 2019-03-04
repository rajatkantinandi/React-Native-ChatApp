import React from "react";
import { View, Text } from "react-native";

export default () => {
  return (
    <View
      style={{
        flex: 0,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "#222265",
        padding: 4,
        paddingTop: 50
      }}
    >
      <Text style={{ fontSize: 35, color: "#ccf" }}>ChatApp</Text>
    </View>
  );
};
