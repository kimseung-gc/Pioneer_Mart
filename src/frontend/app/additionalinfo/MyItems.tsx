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

const ReportedItemsScreen = () => {
  const { authToken } = useAuth();
  const { screens, setActiveScreen, loadItems, loadCategories, categories } =
    useItemsStore();

  const screenId = "reported"; // current screen state
  const { filteredItems, isLoading } = screens[screenId];

  useEffect(() => {
    setActiveScreen(screenId);
    loadItems(screenId, authToken || "");
    loadCategories(authToken || "");
  }, [authToken]);

  const reportedItems =
    screenId === "reported"
      ? filteredItems
          .filter((report: any) => report.item) // only keep reports with items
          .map((report: any) => report.item)
      : filteredItems;

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
              items={reportedItems}
              isLoading={isLoading}
              source="myItems"
            />
          </View>
        </>
      )}
    </>
  );
};
export default ReportedItemsScreen;
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
