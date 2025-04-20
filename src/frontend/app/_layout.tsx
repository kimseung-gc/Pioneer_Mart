import { useFonts } from "expo-font";
import { router, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "./contexts/AuthContext";
import React from "react";
import { AppInitialier } from "@/components/AppInitializer";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      // If we're in the tabs section but not authenticated, redirect to auth
      if (!token && pathname.includes("/(tabs)")) {
        router.replace("/(auth)");
      }

      // If we're in the auth section but already authenticated, redirect to tabs
      if (token && pathname.includes("/(auth)")) {
        router.replace("/(tabs)");
      }
    };
    checkAuth();
  }, [pathname]); // added this as a dependency to check on route changess

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppInitialier />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
          options={{ gestureEnabled: false, headerBackVisible: false }} //prevent user from going back to (auth) tabs
        />
        <Stack.Screen
          name="(auth)"
          options={{ gestureEnabled: false, headerShown: false }} // user can't go back from here either but just putting this in case
        />
      </Stack>
    </AuthProvider>
  );
}
