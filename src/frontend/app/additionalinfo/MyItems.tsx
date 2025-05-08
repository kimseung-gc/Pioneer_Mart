import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import ProductList from "@/components/ProductList";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const { colors } = useTheme();

const MyItems = () => {
  const { authToken } = useAuth();
  const { screens, setActiveScreen, loadItems, loadCategories, categories } =
    useItemsStore();

  //current screen state
  const screenId = "myItems";
  const { filteredItems, isLoading } = screens[screenId];

  useEffect(() => {
    setActiveScreen(screenId);
    loadItems(screenId, authToken || "");
    loadCategories(authToken || "");
  }, [authToken]);

  return (
    <>
      {/* TODO: need to fix the header so that the width of header fits for smaller screen */}
      {/* <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => router.back()}
            >
              <Entypo name="chevron-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ),
          header: () => <Header screenId={screenId} />,
        }}
      /> */}
      <Stack.Screen
        options={{
          headerTitle: "My Items",
          headerTitleAlign: "center",
          headerShown: true,
          headerBackTitle: "Back",
          headerTintColor: colors.accent
        }}
      />   
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.accent}
            testID="loading-indicator"
          />
        </View>
      ) : (
        <>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Categories screenId={screenId} categories={categories} />
            <ProductList
              items={filteredItems}
              isLoading={isLoading}
              source="myItems"
            />
          </View>
        </>
      )}
    </>
  );
};

export default MyItems;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background, 
  },
});
