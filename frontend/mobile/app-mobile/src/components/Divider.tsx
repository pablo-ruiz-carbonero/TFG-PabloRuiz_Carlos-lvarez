import React from "react";
import { View, StyleSheet } from "react-native";

const Divider = () => (
  <View style={styles.line} />
);

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: "#413f3f",
    marginVertical: 15,
    width: "80%", // O "100%" según quieras que ocupe
    alignSelf: "center", 
  }
});

export default Divider;