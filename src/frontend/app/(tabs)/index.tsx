import React, { useCallback, useEffect } from "react";
import { Stack, useFocusEffect } from "expo-router";

import { useAuth } from "../contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import ProductList from "@/components/ProductList";

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

  const { authToken } = useAuth(); //auth context
  const { isReturningFromDetails, setIsReturningFromDetails } = useItemsStore();

  // useFocusEffect(
  //   useCallback(() => {
  //     const refreshData = async () => {
  //       if (authToken && !isReturningFromDetails) {
  //         await refreshItems(screenId, authToken);
  //       }
  //       setIsReturningFromDetails(false); // reset flag after refreshing data
  //     };
  //     refreshData();
  //   }, [authToken, isReturningFromDetails])
  // );

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
      <Categories screenId={screenId} categories={categories} />
      <ProductList
        items={filteredItems}
        isLoading={isLoading}
        source={"home"}
      />
    </>
  );
};

export default HomeScreen;
