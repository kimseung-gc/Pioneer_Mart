/**
 * ItemDetails.tsx
 *
 * This screen displays the detailed view of a marketplace item.
 * It shows the item's image, description, price, seller info, and category.
 * Users can:
 *  - View the item's full details.
 *  - Request to purchase the item & report item (unless they are the seller).
 *  - Edit their listing if they are the item owner.
 *  - See confirmation of a submitted purchase request.
 *  - See confirmation of a submitted report
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

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { useCallback, useEffect, useRef, useState } from "react";
import ItemPurchaseModal from "@/components/ItemPurchaseModal";
import axios from "axios";
import { useUserStore } from "@/stores/userStore";
import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import ZoomModal from "@/components/ZoomModal";
import { useItemsStore } from "@/stores/useSearchStore";
import ReportModal from "@/components/ReportModal";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import api from "@/types/api";

const { width, height } = Dimensions.get("window");

const ItemDetails = () => {
  const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
  const router = useRouter();
  const { id, item: itemString, source, refreshKey } = useLocalSearchParams();
  const [item, setItem] = useState(
    itemString ? JSON.parse(itemString as string) : null
  );
  const hasFetched = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [hasRequestedItem, setHasRequestedItem] = useState(false);
  const [hasReportedItem, setHasReportedItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const { authToken } = useAuth();
  const { userData } = useUserStore();
  const { toggleReport } = useItemsStore();

  // image carousel stuff
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    return () => {
      setIsLoading(false);
      setItem(null);
      setIsVisible(false);
    };
  }, []);

  // useCallback will memoize the function and return the same instance across renders unless item has changed
  const getItemImages = useCallback(() => {
    if (!item) return [];

    const primary = item.image ? [item.image] : [];

    const additional =
      item.additional_images && Array.isArray(item.additional_images)
        ? item.additional_images.map((img: any) => img.image)
        : [];
    return [...primary, ...additional];
  }, [item]);

  // ensure that the images array is only recalculated if the getItemImages function changes(which only happens when item changes)
  const images = React.useMemo(() => getItemImages(), [getItemImages]);

  // tetch the latest item data from the API
  const fetchItemDetails = async () => {
    if (!id) {
      console.log("No item Id provided");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const cleanToken = authToken?.trim();
      const response = await api.get(`${BASE_URL}/api/items/${id}/`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const fetchedItem = response.data;
      setItem(fetchedItem);
      if (
        fetchedItem.purchase_requesters &&
        userData &&
        fetchedItem.purchase_requesters.some(
          (requester: { id: number }) => requester.id === userData.id
        )
      ) {
        setHasRequestedItem(true);
      } else {
        setHasRequestedItem(false);
      }

      setHasReportedItem(fetchedItem.is_reported || false);
    } catch (error) {
      console.error("Error fetching item details:", error);
      Alert.alert(
        "Error",
        "Unable to load item details. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!hasFetched.current) {
        fetchItemDetails();
        hasFetched.current = true;
      }

      return () => {
        // reset the ref when the screen loses focus
        hasFetched.current = false;
      };
    }, [id, authToken])
  );
  const openModal = () => {
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  const handleDelete = async () => {
    if (!id) {
      console.log("No item Id provided");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const cleanToken = authToken?.trim();
      const response = await api.delete(
        `${BASE_URL}/api/items/${id}/delete_item/`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
          timeout: 10000,
        }
      );
      Toast.show({
        type: "success",
        text1: "Item deleted successfully",
      });
      router.replace("/(tabs)");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Unable to delete item. Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseRequest = React.useCallback(
    async (authToken: string | null) => {
      if (!item) return;

      try {
        const cleanToken = authToken?.trim();
        const response = await api.post(
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
    },
    [item, authToken]
  );

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

  const startChat = async () => {
    if (!item || !userData) return;

    setChatLoading(true);

    try {
      const cleanToken = authToken?.trim();
      const response = await api.get(
        `${BASE_URL}/api/chat/get-or-create-room/`,
        {
          params: { user_id: item.seller, item_id: item.id }, // Assuming item.seller contains the seller's user id
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );
      const chatRoom = response.data.room;
      if (!chatRoom || !chatRoom.id) {
        throw new Error("Invalid room data received");
      }
      // Navigate to the chat room
      router.push({
        pathname: `/chat/[id]`,
        params: {
          id: chatRoom.id.toString(),
          user_id: userData?.id,
          username: item.seller_name, // CAUTION: variable names are a bit weird here
          receiver_id: item.seller.toString(),
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

  if (isLoading || !item) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          testID="activity-indicator"
          size="large"
          color="blue"
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: item.title,
          headerTitleAlign: "center",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <ReportModal
          isVisible={isReportModalVisible}
          onClose={() => {
            setIsReportModalVisible(false);
            setHasReportedItem(true);
          }}
          itemId={item.id}
        />
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
        {/* all the item details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Price: ${item.price}</Text>
          <Text style={styles.title}>Name: {item.title}</Text>
          <Text style={styles.title}>Description: {item.description}</Text>
          <Text style={styles.title}>Seller: {item.seller_name}</Text>
          <Text style={styles.title}>Date Posted: {item.created_at}</Text>
          <Text style={styles.title}>Category: {item.category_name}</Text>
          {isOwner && (
            <>
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
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Delete Item</Text>
              </TouchableOpacity>
            </>
          )}

          {source !== "myItems" && !isOwner && (
            <>
              <TouchableOpacity
                style={[
                  styles.purchaseRequestButton,
                  hasRequestedItem && styles.disabledButton,
                ]}
                onPress={() => handlePurchaseRequest(authToken)}
                disabled={hasRequestedItem}
              >
                <Text style={styles.buttonText}>
                  {hasRequestedItem ? "Purchase Requested" : "Request Purchase"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={startChat}
                disabled={chatLoading}
              >
                {chatLoading ? (
                  <ActivityIndicator
                    testID="activity-indicator"
                    size="small"
                    color="white"
                  />
                ) : (
                  <>
                    <Entypo name="chat" size={20} color="white" />
                    <Text style={styles.chatButtonText}>Message Seller</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.reportItemButton,
                  hasReportedItem && styles.disabledButton,
                ]}
                onPress={async (e) => {
                  e.stopPropagation();
                  try {
                    if (!item.is_reported) {
                      setIsReportModalVisible(true);
                    } else {
                      await toggleReport(item.id, authToken || "", "");
                      setHasReportedItem(true);
                    }
                  } catch (error) {
                    console.error("Error toggling report:", error);
                    Alert.alert(
                      "Error",
                      "Failed to report item. Please try again"
                    );
                  }
                }}
                disabled={hasReportedItem}
              >
                <Text style={styles.buttonText}>
                  {hasReportedItem ? "Item Reported" : "Report Item"}
                </Text>
              </TouchableOpacity>
            </>
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
    paddingTop: 20,
    backgroundColor: "#fff",
  },

  carouselContainer: {
    width: width,
    height: height * 0.35,
    position: "relative",
  },
  itemImage: {
    width: width,
    height: "100%",
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
  deleteButton: {
    backgroundColor: "red",
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
  reportItemButton: {
    backgroundColor: "red",
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
