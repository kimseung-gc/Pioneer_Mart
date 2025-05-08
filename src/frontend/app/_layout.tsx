import { useFonts } from "expo-font";
import { router, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import React from "react";
import { StatusBar, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync().catch(console.warn);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const pathname = usePathname();
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token && pathname.includes("/(tabs)")) {
          console.log("No token, redirecting to auth");
          router.replace("/(auth)");
        } else if (token && pathname.includes("/(auth)")) {
          console.log("Token found, redirecting to tabs");
          router.replace("/(tabs)");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (pathname.includes("/(tabs)")) {
          router.replace("/(auth)");
        }
      }
    };

    if (loaded) {
      checkAuth();
    }
  }, [loaded, pathname]);

  useEffect(() => {
    const hideSplash = async () => {
      if (!loaded || splashHidden) return;

      try {
        await SplashScreen.hideAsync();
        setSplashHidden(true);
        console.log("Splash screen hidden");
      } catch (err) {
        console.error("Error hiding splash screen:", err);
        setSplashHidden(true);
      }
    };

    const timeout = setTimeout(() => {
      if (!splashHidden) {
        console.warn("Forcing splash screen hide after timeout");
        SplashScreen.hideAsync().catch(() => {});
        setSplashHidden(true);
      }
    }, 3000);

    hideSplash();

    return () => clearTimeout(timeout);
  }, [loaded, splashHidden]);

  if (error) {
    console.error("Font loading error:", error);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFF9F0",
        }}
      >
        <Text style={{ fontSize: 18 }}>
          Something went wrong. Please restart the app.
        </Text>
      </View>
    );
  }

  if (!loaded || !splashHidden) {
    return <View style={{ flex: 1, backgroundColor: "#FFF9F0" }} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
            <View
              style={{
                flex: 1,
                alignItems: "center",
                backgroundColor: "#FFF9F0",
              }}
            >
              <View style={{ flex: 1, width: "100%", maxWidth: 400 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name="(tabs)"
                    options={{
                      gestureEnabled: false,
                      headerBackVisible: false,
                    }}
                  />
                  <Stack.Screen
                    name="(auth)"
                    options={{ gestureEnabled: false, headerShown: false }}
                  />
                </Stack>
              </View>
            </View>
          </GestureHandlerRootView>
          <Toast />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
