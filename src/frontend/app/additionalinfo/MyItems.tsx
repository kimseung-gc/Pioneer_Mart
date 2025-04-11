import Categories from "@/components/Categories";
import Header from "@/components/Header";
import ProductList from "@/components/ProductList";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import { Entypo } from "@expo/vector-icons";
import React from "react";

const MyItems = () => {
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
    return () => {}; //cleanup when navigating away
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
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <Categories screenId={screenId} categories={categories} />
          <ProductList
            items={filteredItems}
            isLoading={isLoading}
            source="myItems"
          />
        </>
      )}
    </>
  );
};

export default MyItems;
