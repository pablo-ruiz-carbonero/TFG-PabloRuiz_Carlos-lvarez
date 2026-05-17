// src/components/common/Button.tsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

const Button: React.FC<Props> = ({ title, onPress, loading }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={styles.text}>{loading ? "Cargando..." : title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Button;
