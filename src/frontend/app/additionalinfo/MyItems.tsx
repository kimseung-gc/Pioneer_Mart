import Categories from "@/components/Categories";
import Header from "@/components/Header";
import ProductList from "@/components/ProductList";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import { Entypo } from "@expo/vector-icons";
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const MyItems = () => {
  const { colors } = useTheme();
  const { authToken } = useAuth(); //auth context
  const { screens, setActiveScreen, loadItems, loadCategories, categories } =
    useItemsStore();

  //current screen state
  const screenId = "myItems";
  const { filteredItems, searchQuery, isLoading } = screens[screenId];

  useEffect(() => {
    setActiveScreen(screenId);
    loadItems(screenId, authToken || "");
    loadCategories(authToken || "");
    // return () => {}; //cleanup when navigating away
  }, [authToken]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => router.back()}
            >
              <Entypo name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
          ),
          header: () => <Header screenId={screenId} />,
        }}
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#A25E5E"
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
    backgroundColor: "#FFF9F0", // 👈 soft cream background
  },
});
