import React, { useRef } from "react";
import { Animated, Easing, Pressable } from "react-native";

export const AnimatedTabBarButton = ({ onPress, children }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      android_ripple={{ color: "transparent" }}
      onPressIn={handlePressIn}
      //   onPressOut={handlePressOut}
      onPress={onPress}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          transform: [{ scale: scaleAnim }],
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
