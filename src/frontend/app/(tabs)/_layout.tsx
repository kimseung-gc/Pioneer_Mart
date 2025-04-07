import { useEffect } from "react";
import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";

// This defines the basic layout of the app after user's logged in
export default function TabLayout() {
  return (
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
          tabBarIcon: () => <Ionicons name="notifications-outline" size={22} />,
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
          tabBarIcon: () => <MaterialIcons name="favorite-outline" size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: () => <Ionicons name="person-outline" size={22} />,
        }}
      />
    </Tabs>
  );
}
