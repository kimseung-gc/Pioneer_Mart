import { Stack, Tabs } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useRef } from "react";
import { AppInitialier } from "@/components/AppInitializer";
import { Animated, Pressable } from "react-native";
import { AnimatedTabBarButton } from "@/components/AnimatedTabBarButton";

// This defines the basic layout of the app after user's logged in
export default function TabLayout() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false, // Disable gesture navigation
          headerBackVisible: false, // Hide back button
          animation: "none", // Optional: removes animation which can help with navigation issues
        }}
      />
      <AppInitialier />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#FFF9F0",
            borderTopColor: "#FFE0B2",
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: "#C98474",
          tabBarInactiveTintColor: "#888888",
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: () => <Ionicons name="home-outline" size={22} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notification",
            tabBarIcon: () => (
              <Ionicons name="notifications-outline" size={22} />
            ),
          }}
        />
        <Tabs.Screen
          name="additem"
          options={{
            title: "Add Item",
            tabBarIcon: () => <Ionicons name="add" size={24} color="black" />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favorites",
            tabBarIcon: () => (
              <MaterialIcons name="favorite-outline" size={22} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: () => (
              <Ionicons name="settings-outline" size={22} color="black" />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
