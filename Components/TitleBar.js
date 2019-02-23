import React from "react";
import { SafeAreaView, Text } from "react-native";

export default () => {
  return (
    <SafeAreaView
      style={{
        flex: 0,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "#222265",
        padding: 4,
        paddingTop: 40
      }}
    >
      <Text style={{ fontSize: 35, color: "lime" }}>ChatApp</Text>
    </SafeAreaView>
  );
};
