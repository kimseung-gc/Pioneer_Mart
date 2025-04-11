import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, Stack, useLocalSearchParams, useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useState } from "react";
import ItemPurchaseModal from "@/components/ItemPurchaseModal";
import SingleItem from "@/components/SingleItem";
import { useAuth } from "./contexts/AuthContext";
import axios from "axios";
import { BASE_URL } from "@/config";
import useSingleItemStore from "@/stores/singleItemStore";
import { useUserStore } from "@/stores/userStore";
import React from "react";

const width = Dimensions.get("window").width; // -40 b/c marginHorizontal in index.tsx is 20 so we need to reduce the width by 20x2

const ItemDetails = () => {
  const router = useRouter();
  const { item: itemString, source, refreshKey } = useLocalSearchParams();
  // const item = JSON.parse(itemString as string); // turn into JSON object for details page
  const [item, setItem] = useState(JSON.parse(itemString as string));
  const [isVisible, setIsVisible] = useState(false);
  const [hasRequestedItem, setHasRequestedItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuth();
  const { userData } = useUserStore();
  // const { hasRequestedItem, setHasRequestedItem } = useSingleItemStore();
  useEffect(() => {
    if (itemString) {
      try {
        const parsedItem = JSON.parse(itemString as string);
        setItem(parsedItem);
      } catch (err) {
        console.error("Failed to parse item string:", err);
      }
    }
  }, [refreshKey]);
  // Will run whenever user wants to see ItemDetails
  useEffect(() => {
    const checkPurchaseRequest = async (authToken: string | null) => {
      try {
        setIsLoading(true);
        const cleanToken = authToken?.trim();
        const response = await axios.get(`${BASE_URL}/api/requests/sent/`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        // Check if any of the sent requests match this item
        const hasRequested = response.data.some(
          (request: any) => request.listing.id === item.id && request.is_active
        );
        setHasRequestedItem(hasRequested);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking purchase request:", error);
        setIsLoading(false);
      }
    };
    checkPurchaseRequest(token.authToken);
  }, [item.id, token, hasRequestedItem, itemString]);

  const openModal = () => {
    setIsVisible(true);
    console.log("Requested purchase...");
    console.log("Seller: ", item.seller_name);
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  const handlePurchaseRequest = async (authToken: string | null) => {
    try {
      const cleanToken = authToken?.trim();
      const response = await axios.post(
        `${BASE_URL}/api/items/${item.id}/request_purchase/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setHasRequestedItem(true); //update state of item for user
      openModal(); // show the user that the request was sent.
    } catch (error) {
      console.error("Error requesting purchase:", error);
      alert("Failed to send purchase request. Please try again.");
    }
  };

  // Find out if the user is the owner of the item
  const isOwner = userData && item.seller === userData.id;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: item.title,
          headerTitleAlign: "center",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => {
                router.back();
                console.log("navigating back...");
              }}
            >
              <Entypo name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <ItemPurchaseModal
          isVisible={isVisible}
          onClose={closeModal}
          email={item.seller_name}
        />
        <SingleItem item={item} />
        <Text style={styles.title}>Price: ${item.price}</Text>
        <Text style={styles.title}>Name: {item.title}</Text>
        <Text style={styles.title}>Description: {item.description}</Text>
        <Text style={styles.title}>Seller: {item.seller_name}</Text>
        <Text style={styles.title}>Date Posted: {item.created_at}</Text>
        <Text style={styles.title}>Category: {item.category_name}</Text>
        {isOwner && (
          <TouchableOpacity
            style={{
              backgroundColor: "#4CAF50",
              padding: 15,
              borderRadius: 5,
              marginTop: 20,
              width: "100%",
              alignItems: "center",
            }}
            onPress={() => {
              router.push({
                pathname: "/EditItem",
                params: { item: JSON.stringify(item) },
              });
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Edit Listing</Text>
          </TouchableOpacity>
        )}

        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: 20 }}
            size="small"
            color="blue"
          />
        ) : (
          source !== "myItems" &&
          !isOwner && (
            <TouchableOpacity
              style={{
                backgroundColor: hasRequestedItem ? "gray" : "blue",
                padding: 15,
                borderRadius: 5,
                marginTop: 20,
                width: "100%",
                alignItems: "center",
              }}
              onPress={() => handlePurchaseRequest(token.authToken)}
              disabled={hasRequestedItem}
            >
              <Text style={{ color: "white", fontSize: 16 }}>
                {hasRequestedItem ? "Purchase Requested" : "Request Puchase"}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
  },
  itemImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  favBtn: {
    position: "absolute",
    right: 20,
    top: 20,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 5,
    borderRadius: 30,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
});
