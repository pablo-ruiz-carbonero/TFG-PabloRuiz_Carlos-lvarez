// src/components/common/Input.tsx

import React from "react";
import { TextInput, TextInputProps, StyleProp, TextStyle } from "react-native";

interface Props extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

const Input: React.FC<Props> = ({ style, ...props }) => {
  return <TextInput style={style} {...props} />;
};

export default Input;