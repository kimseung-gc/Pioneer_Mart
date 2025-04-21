import { Stack, Tabs } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";

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
      <Tabs screenOptions={{ headerShown: false }}>
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
            tabBarBadge: 3,
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
