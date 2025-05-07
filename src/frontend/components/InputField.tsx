import React from "react";
import { TextInput, StyleSheet } from "react-native";

const InputField = (props: React.ComponentProps<typeof TextInput>) => {
  return <TextInput style={styles.inputField} {...props} />;
};

export default InputField;

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: "stretch",
    borderRadius: 5,
    fontSize: 16,
    color: "#000000",
    width: "60%",
  },
});
