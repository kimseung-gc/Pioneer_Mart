import React, { useEffect } from "react";

import { router, Stack } from "expo-router";

import { useAuth } from "../contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import ProductList from "@/components/ProductList";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import { TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";

const ReportedItemsScreen = () => {
  const { screens, setActiveScreen, loadItems, loadCategories, categories } =
    useItemsStore();
  const { authToken } = useAuth();

  const screenId = "reported"; // current screen state
  const { filteredItems, isLoading } = screens[screenId];

  useEffect(() => {
    setActiveScreen(screenId);
    loadItems(screenId, authToken || "");
    loadCategories(authToken || "");
  }, [authToken]);
  console.log("reported items:", filteredItems);

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
      <Categories screenId={screenId} categories={categories} />
      <ProductList
        items={filteredItems}
        isLoading={isLoading}
        source={"reported"}
      />
    </>
  );
};
export default ReportedItemsScreen;
