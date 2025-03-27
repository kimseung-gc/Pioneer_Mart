import { Stack } from "expo-router";
import { SafeAreaView } from "react-native";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false, // Hide headers by default for auth screens
          gestureEnabled: false, // Disable gestures for navigation control
        }}
      />
      {children}
    </SafeAreaView>
  );
};

export default AuthLayout;
