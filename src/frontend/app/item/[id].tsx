/**
 * ItemDetails.tsx
 *
 * This screen displays the detailed view of a marketplace item.
 * It shows the item's image, description, price, seller info, and category.
 * Users can:
 *  - View the item's full details.
 *  - Request to purchase the item (unless they are the seller).
 *  - Edit their listing if they are the item owner.
 *  - See confirmation of a submitted purchase request.
 *
 * Features:
 * - Uses React Navigation (Expo Router) for navigation stack handling.
 * - Uses Axios to fetch and post purchase request data from backend API.
 * - Uses AuthContext and Zustand stores for user and item state.
 * - Includes a modal component to confirm request submission.
 * - Displays loading state while fetching request status.
 *
 * Props:
 * - Receives item data via URL params (`item`, `source`, `refreshKey`).
 *
 * Dependencies:
 * - React Native components
 * - Expo Router for navigation
 * - Zustand for state management
 * - Axios for HTTP requests
 * - Custom components: ItemPurchaseModal, SingleItem
 */
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ListRenderItemInfo,
} from "react-native";
import { router, Stack, useLocalSearchParams, useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useState } from "react";
import ItemPurchaseModal from "@/components/ItemPurchaseModal";
import SingleItem from "@/components/SingleItem";
import axios from "axios";
import { BASE_URL } from "@/config";
import useSingleItemStore from "@/stores/singleItemStore";
import { useUserStore } from "@/stores/userStore";
import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { ChatRoom } from "@/types/chat";

const width = Dimensions.get("window").width;

const ItemDetails = () => {
  const router = useRouter();
  const { id, item: itemString, source, refreshKey } = useLocalSearchParams();
  const [item, setItem] = useState(
    itemString ? JSON.parse(itemString as string) : null
  );
  const [isVisible, setIsVisible] = useState(false);
  const [hasRequestedItem, setHasRequestedItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const authToken = useAuth();
  const { userData } = useUserStore();

  // Fetch the latest item data from the API
  const fetchItemDetails = async () => {
    if (!id) {
      console.log("No item Id provided");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const cleanToken = authToken.authToken?.trim();
      const response = await axios.get(`${BASE_URL}/api/items/${id}/`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      setItem(response.data);
    } catch (error) {
      console.error("Error fetching item details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchItemDetails();
      return () => {
        // Optional cleanup
      };
    }, [id, authToken])
  );

  // Check if user has requested this item
  useEffect(() => {
    const checkPurchaseRequest = async (authToken: string | null) => {
      if (!item || !authToken) return;

      try {
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
        //   setIsLoading(false);
      } catch (error) {
        console.error("Error checking purchase request:", error);
        setIsLoading(false);
      }
    };

    checkPurchaseRequest(authToken.authToken);
  }, [item, authToken.authToken]);

  const openModal = () => {
    setIsVisible(true);
    console.log("Requested purchase...");
    console.log("Seller: ", item?.seller_name);
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  const handlePurchaseRequest = async (authToken: string | null) => {
    if (!item) return;

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
  const isOwner = userData && item && item.seller === userData.id;

  if (isLoading || !item) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  const startChat = async () => {
    if (!item || !userData) return;

    setChatLoading(true);

    try {
      const cleanToken = authToken.authToken?.trim();
      console.log(
        "Starting chat about item:",
        item.id,
        "with seller ID:",
        item.seller
      );
      const response = await axios.get(
        `${BASE_URL}/api/chat/get-or-create-room/`,
        {
          params: { user_id: item.seller, item_id: item.id }, // Assuming item.seller contains the seller's user id
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );
      const chatRoom = response.data.room;
      console.log("Chat room created/retrieved:", chatRoom);
      if (!chatRoom || !chatRoom.id) {
        throw new Error("Invalid room data received");
      }
      // Navigate to the chat room
      router.push({
        pathname: `/chat/[id]`,
        params: {
          id: chatRoom.id.toString(),
          name: item.seller_name,
          itemTitle: item.title || "No item",
        }, // Assuming item.seller_name is the seller's name
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to start a chat. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

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
                pathname: "/item/[id]/edit",
                params: { id: item.id.toString(), item: JSON.stringify(item) },
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
            <>
              <TouchableOpacity
                style={{
                  backgroundColor: hasRequestedItem ? "gray" : "blue",
                  padding: 15,
                  borderRadius: 5,
                  marginTop: 20,
                  width: "100%",
                  alignItems: "center",
                }}
                onPress={() => handlePurchaseRequest(authToken.authToken)}
                disabled={hasRequestedItem}
              >
                <Text style={{ color: "white", fontSize: 16 }}>
                  {hasRequestedItem ? "Purchase Requested" : "Request Purchase"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={startChat}
                disabled={chatLoading}
              >
                {chatLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Entypo name="chat" size={20} color="white" />
                    <Text style={styles.chatButtonText}>Message Seller</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
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
  roomItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  roomName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  roomDetails: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  chatButton: {
    backgroundColor: "#22a45d",
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
});
