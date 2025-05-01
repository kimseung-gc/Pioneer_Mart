import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Stack } from "expo-router";

import { useAuth } from "../contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import ProductList from "@/components/ProductList";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import axios from "axios";
import { Alert, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useUserStore } from "@/stores/userStore";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";

const FavoritesScreen = () => {
  const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
  const { screens, setActiveScreen, loadItems, loadCategories, categories } =
    useItemsStore();
  const { authToken } = useAuth();

  const screenId = "favorites"; // current screen state
  const { filteredItems, isLoading } = screens[screenId];
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const { userData } = useUserStore();

  const notRequestedItems = useMemo(() => {
    return filteredItems.filter(
      (item) =>
        !item.purchase_requesters?.some(
          (requester: any) => requester.id === userData?.id
        )
    );
  }, [filteredItems, userData, refreshTrigger]);
  useFocusEffect(
    useCallback(() => {
      setActiveScreen(screenId);
      loadItems(screenId, authToken || "");
      loadCategories(authToken || "");
    }, [authToken])
  );

  const handleRequestAllItems = async () => {
    if (!authToken || notRequestedItems.length < 1) return;
    setIsRequesting(true);
    let successCount = 0;
    let failCount = 0;
    try {
      for (const item of notRequestedItems) {
        try {
          await axios.post(
            `${BASE_URL}/api/items/${item.id}/request_purchase/`,
            {},
            {
              headers: {
                Authorization: `Bearer ${authToken.trim()}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          successCount++;
        } catch (error) {
          console.error(
            `Error requesting purchase for item ${item.id}:`,
            error
          );
          failCount++;
        }
      }
      // show the success message
      setRequestSuccess(true);
      setTimeout(() => setRequestSuccess(false), 3000); // hide the message after 3 seconds
    } catch (error) {
      console.error("Error in batch request process:", error);
    } finally {
      setIsRequesting(false);
      await loadItems(screenId, authToken || "");
      setRefreshTrigger((prev) => !prev);
      // send alert with the summary
      if (failCount > 0) {
        Alert.alert(
          "Error:",
          `Requested ${successCount} items successfully. ${failCount} items failed.`
        );
      } else if (successCount > 0) {
        Alert.alert(`${successCount} items were requested successfully!`);
      }
    }
  };
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
        source={"favorites"}
      />
      {notRequestedItems.length > 0 && (
        <View style={styles.floatingButtonContainer}>
          {requestSuccess && (
            <View style={styles.successMessageContainer}>
              <Text style={styles.successMessage}>
                Request sent successfully!
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.floatingButton,
              isRequesting && styles.floatingButtonDisabled,
            ]}
            onPress={handleRequestAllItems}
            // onPress={() => console.log("Hello")}
            disabled={isRequesting}
          >
            <Text style={styles.floatingButtonText}>
              {isRequesting ? "Requesting..." : "Request All"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};
export default FavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  floatingButtonContainer: {
    position: "absolute",
    right: 20,
    bottom: 30,
    alignItems: "flex-end",
  },
  floatingButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25, // More rounded corners
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonDisabled: {
    backgroundColor: "#88c4f8",
  },
  floatingButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  successMessageContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    padding: 8,
    borderRadius: 15,
    marginBottom: 10,
  },
  successMessage: {
    color: "white",
    fontWeight: "500",
    fontSize: 12,
  },
});
