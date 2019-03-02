import React from "react";
import { Modal, View, Text, ActivityIndicator, Button } from "react-native";

export default (ProgressDialog = ({ visible, text }) => (
  <Modal onRequestClose={() => null} visible={visible} transparent={true}>
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,180,0.3)",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <View style={{ borderRadius: 10, backgroundColor: "white", padding: 30 }}>
        <Text style={{ fontSize: 25, fontWeight: "200", color: "#000" }}>
          {text}
        </Text>
        <ActivityIndicator size="large" />
      </View>
    </View>
  </Modal>
));
