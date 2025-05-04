import React, { useCallback, useEffect } from "react";
import { Stack, useFocusEffect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import ProductList from "@/components/ProductList";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const HomeScreen = () => {
  const {
    screens,
    setActiveScreen,
    loadItems,
    loadCategories,
    categories,
    refreshItems,
  } = useItemsStore();

  const screenId = "home";
  const { filteredItems, isLoading } = screens[screenId];
  const { colors } = useTheme();
  const { authToken } = useAuth(); //auth context
  // Load items and categories when component mounts
  useEffect(() => {
    setActiveScreen(screenId);
    loadItems(screenId, authToken || "");
    loadCategories(authToken || "");
  }, [authToken]);
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <Header screenId={screenId} />,
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Categories screenId={screenId} categories={categories} />
        <ProductList
          items={filteredItems}
          isLoading={isLoading}
          source={"home"}
        />
      </View>
    </>
  );
};

export default HomeScreen;
