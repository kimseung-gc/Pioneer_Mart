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
  Image,
  FlatList,
} from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";

import { router, Stack, useLocalSearchParams, useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useRef, useState } from "react";
import ItemPurchaseModal from "@/components/ItemPurchaseModal";
import SingleItem from "@/components/SingleItem";
import axios from "axios";
import { BASE_URL } from "@/config";
import useSingleItemStore from "@/stores/singleItemStore";
import { useUserStore } from "@/stores/userStore";
import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import ZoomModal from "@/components/ZoomModal";

const { width, height } = Dimensions.get("window");

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
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const authToken = useAuth();
  const { userData } = useUserStore();

  // image carousel stuff
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const getItemImages = () => {
    if (!item) return [];

    // if the item has multiple images, then use them
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    }

    // otherwise use the single image as an array
    return item.image ? [item.image] : [];
  };

  const images = getItemImages(); // get the images of the item

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

  // function to handle image scroll
  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  // render each image in the carousel
  const renderImageItem = ({ item: imageUrl }: { item: string }) => {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={styles.itemImage}
        resizeMode="cover"
      />
    );
  };
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
      <SafeAreaView style={styles.container}>
        <ItemPurchaseModal
          isVisible={isVisible}
          onClose={closeModal}
          email={item.seller_name}
        />
        {isZoomVisible && (
          <ZoomModal
            isVisible={isZoomVisible}
            onClose={() => setIsZoomVisible(false)}
            item={item} // Use the updated item
          />
        )}
        <TapGestureHandler
          numberOfTaps={1}
          onActivated={() => setIsZoomVisible(true)}
        >
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={
                images.length > 0
                  ? images
                  : ["src/frontend/assets/images/defaultpic.png"]
              }
              renderItem={renderImageItem}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />

            {/* image counter overlay */}
            <View style={styles.imageCounterContainer}>
              <Text style={styles.imageCounter}>
                {currentImageIndex + 1} of {images.length || 1}
              </Text>
            </View>
          </View>
        </TapGestureHandler>
        {/* <SingleItem item={item} /> */}
        {/* all the item details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Price: ${item.price}</Text>
          <Text style={styles.title}>Name: {item.title}</Text>
          <Text style={styles.title}>Description: {item.description}</Text>
          <Text style={styles.title}>Seller: {item.seller_name}</Text>
          <Text style={styles.title}>Date Posted: {item.created_at}</Text>
          <Text style={styles.title}>Category: {item.category_name}</Text>
          {isOwner && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                router.push({
                  pathname: "/item/[id]/edit",
                  params: {
                    id: item.id.toString(),
                    item: JSON.stringify(item),
                  },
                });
              }}
            >
              <Text style={styles.buttonText}>Edit Listing</Text>
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
                  style={[
                    styles.purchaseRequestButton,
                    hasRequestedItem && styles.disabledButton,
                  ]}
                  onPress={() => handlePurchaseRequest(authToken.authToken)}
                  disabled={hasRequestedItem}
                >
                  <Text style={styles.buttonText}>
                    {hasRequestedItem
                      ? "Purchase Requested"
                      : "Request Purchase"}
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
      </SafeAreaView>
    </>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // padding: 20,
    justifyContent: "center",
  },
  carouselContainer: {
    width: width,
    height: height * 0.35,
    position: "relative",
  },
  itemImage: {
    width: width,
    height: "100%",
    // borderRadius: 15,
    // marginTop: 10,
    // marginBottom: 10,
  },
  imageCounterContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  imageCounter: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  detailsContainer: {
    padding: 20,
    flex: 1,
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
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  purchaseRequestButton: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
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
