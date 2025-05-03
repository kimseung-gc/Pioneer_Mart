import React, { useRef } from "react";
import { Animated, Easing, Pressable } from "react-native";

export const AnimatedTabBarButton = ({ onPress, children }: any) => {
  return (
    <Pressable
      android_ripple={{ color: "transparent" }}
      onPress={onPress}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
