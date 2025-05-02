import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {};

const NotificationsScreen = (props: Props) => {
  const insets = useSafeAreaInsets();

  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {" "}
      <Text>Notifications Screen</Text>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
