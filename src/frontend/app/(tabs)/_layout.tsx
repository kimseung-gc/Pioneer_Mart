import { Stack, Tabs } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import { AppInitialier } from "@/components/AppInitializer";
import { AnimatedTabBarButton } from "@/components/AnimatedTabBarButton";
import { useAuth } from "../contexts/AuthContext";
import { notificationsApi } from "@/services/notificationsApi";
import { useNavigationState } from "@react-navigation/native";

// This defines the basic layout of the app after user's logged in
export default function TabLayout() {
  const { authToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const currentRoute = useNavigationState(
    (state) => state.routes[state.index]?.name
  );

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (authToken) {
          const count = await notificationsApi.getUnreadcount(authToken);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Failed to fetch unread notifications:", error);
      }
    };

    fetchUnread();

    // Optional: refresh every 60 seconds
    const interval = setInterval(fetchUnread, 120000);
    return () => clearInterval(interval);
  }, [authToken]);

  useEffect(() => {
    const resetCount = async () => {
      if (currentRoute === "notifications" && unreadCount && unreadCount > 0) {
        try {
          await notificationsApi.resetUnreadCount(authToken);
          setUnreadCount(0);
        } catch (err) {
          console.error("Failed to reset unread count", err);
        }
      }
    };
    resetCount();
  }, [currentRoute]);
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
