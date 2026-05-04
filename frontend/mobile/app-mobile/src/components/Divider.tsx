import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing } from "../styles/theme";

const Divider = () => <View style={styles.line} />;

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
    width: "90%",
    alignSelf: "center",
  }
});

export default Divider;