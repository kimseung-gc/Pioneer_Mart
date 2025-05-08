import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import { AppInitialier } from "@/components/AppInitializer";
import { AnimatedTabBarButton } from "@/components/AnimatedTabBarButton";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

// This defines the basic layout of the app after user's logged in
export default function TabLayout() {
  const { authToken } = useAuth();
  const { unreadCount, refreshUnreadCount } = useNotification();

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 120000);
    return () => clearInterval(interval);
  }, []);

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
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={focused ? "#9E8FB2" : "#888888"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notification",
            tabBarBadge: unreadCount ? unreadCount : undefined,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                size={22}
                color={focused ? "#9E8FB2" : "#888888"}
              />
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
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name={focused ? "favorite" : "favorite-outline"}
                size={22}
                color={focused ? "#9E8FB2" : "#888888"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={22}
                color={focused ? "#9E8FB2" : "#888888"}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
