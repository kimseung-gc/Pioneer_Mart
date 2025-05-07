/**
 * PurchaseRequests.tsx
 *
 * This screen displays all active purchase requests for a user, separated into two tabs:
 *  - Sent Requests: Items the user has requested to purchase
 *  - Received Requests: Requests received for items the user is selling
 *
 * Functionality:
 * - Fetches and filters active purchase requests from the backend API.
 * - Allows users to cancel their sent requests.
 * - Uses FlatList with pull-to-refresh functionality.
 * - Dynamically renders content based on tab selection and request availability.
 *
 * Features:
 * - Modern tab interface with animation
 * - Header navigation with back button using Expo Router
 * - Elevated card design for request items
 * - Responsive design and improved empty state handling
 *
 * Dependencies:
 * - React Navigation (Expo Router)
 * - Axios for HTTP requests
 * - Zustand/Context for auth state
 * - React Native FlatList & RefreshControl
 * - Custom components: SingleItem
 *
 * Author: Joyce Gill
 * Date: April 2025
 */

import { PurchaseRequest } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import SingleItem from "@/components/SingleItem";
import React from "react";
import Constants from "expo-constants";
import api from "@/types/api";
import { useTheme } from "../contexts/ThemeContext";

const PurchaseRequests = () => {
  const { colors } = useTheme();
  const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
  // States for PurchaseRequest screen
  const [activeTab, setActiveTab] = useState("sent");
  const [tabPosition] = useState(new Animated.Value(0));
  const [sentRequests, setSentRequests] = useState<PurchaseRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<PurchaseRequest[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { authToken } = useAuth(); // auth context

  // On initial render of this screen, fetch all the requests
  useEffect(() => {
    fetchRequests();
  }, []);

  // Animate tab indicator when tab changes
  useEffect(() => {
    Animated.spring(tabPosition, {
      toValue: activeTab === "sent" ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 70,
    }).start();
  }, [activeTab]);

  /**
   * @function fetchRequests
   * @async
   * @description Fetches both sent and received purchase requests from the backend API.
   * It updates the `sentRequests` and `receivedRequests` state variables with the active requests.
   * Handles loading and error states.
   */
  const fetchRequests = async () => {
    try {
      setIsLoading(true); // start loading
      const sentResponse = await api.get(`${BASE_URL}/api/requests/sent/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const receivedResponse = await api.get(
        `${BASE_URL}/api/requests/received/`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      // we wanna set all requests not just active ones after status update
      setSentRequests(sentResponse.data);
      setReceivedRequests(receivedResponse.data);
    } catch (error) {
      console.error("Error fetching purchase requests:", error);
      Alert.alert(
        "Error",
        "Failed to load purchase requests. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * @function onRefresh
   * @description Handles the refresh action of the FlatList by setting the `refreshing` state to true and calling `fetchRequests`.
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  /**
   * @function acceptRequest
   * @async
   * @param {number} requestId - The ID of the purchase request to accept.
   * @description Sends a request to the backend API to accept a specific purchase request.
   * Upon successful acceptance, it updates the local `receivedRequests` state.
   */
  const acceptRequest = async (requestId: number) => {
    try {
      const cleanToken = authToken?.trim();
      await api.post(
        `${BASE_URL}/api/requests/${requestId}/accept/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
            Accept: "application/json",
          },
        }
      );
      // update all requests related to this listing
      fetchRequests(); // we need to re-fetch everything since multiple listings might be affected?
      Alert.alert("Success", "Purchase request accepted successfully", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert(
        "Error",
        "Failed to accept purchase request. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };

  /**
   * @function declineRequest
   * @async
   * @param {number} requestId - The ID of the purchase request to decline.
   * @description Sends a request to the backend API to decline a specific purchase request.
   * Upon successful decline, it updates the local `receivedRequests` state.
   */
  const declineRequest = async (requestId: number) => {
    try {
      const cleanToken = authToken?.trim();
      await api.post(
        `${BASE_URL}/api/requests/${requestId}/decline/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
            Accept: "application/json",
          },
        }
      );

      // update the local state with the new status
      setReceivedRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "declined" }
            : request
        )
      );
      Alert.alert("Success", "Purchase request declined successfully", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error declining request:", error);
      Alert.alert(
        "Error",
        "Failed to decline purchase request. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };

  /**
   * @function removeRequest
   * @async
   * @param {number} requestId - The ID of the purchase request to remove.
   * @description Sends a request to the backend API to remove a specific purchase request.
   * Upon successful removal, it updates the local state to remove the item from the view.
   */
  const removeRequest = async (requestId: number) => {
    Alert.alert(
      "Remove Request",
      "Are you sure you want to delete this request? This will also cancel the request.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const cleanToken = authToken?.trim();
              await api.delete(
                `${BASE_URL}/api/requests/${requestId}/remove/`,
                {
                  headers: {
                    Authorization: `Bearer ${cleanToken}`,
                  },
                }
              );

              //remove the request from the appropriate list
              if (activeTab === "sent") {
                setSentRequests((prevRequests) =>
                  prevRequests.filter((request) => request.id !== requestId)
                );
              } else {
                setReceivedRequests((prevRequests) =>
                  prevRequests.filter((request) => request.id !== requestId)
                );
              }
              Alert.alert("Success", "Request cancelled & deleted", [
                { text: "OK" },
              ]);
            } catch (error) {
              console.error("Error removing request:", error);
              Alert.alert(
                "Error",
                "Failed to remove request. Please try again later.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  /**
   * @function getStatusColor
   * @param {string} status - The status of the purchase request.
   * @returns {string} - The color code corresponding to the status.
   * @description Returns a color code based on the status of the purchase request.
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f39c12"; // Amber
      case "accepted":
        return "#2ecc71"; // Green
      case "declined":
        return "#e74c3c"; // Red
      default:
        return "#3498db"; // Blue (default)
    }
  };

  /**
   * @function renderRequestItem
   * @param {object} { item } - An object containing the `PurchaseRequest` item to render.
   * @returns {JSX.Element} - A View component representing a single purchase request item in the list.
   * @description Renders a single purchase request item, displaying the associated listing details,
   * the request date, and the status. For sent pending requests, it also includes a "Cancel" button.
   * For received pending requests, it includes "Accept" and "Decline" buttons.
   * All requests include a "Remove" button to remove the request from the user's view.
   */
  const renderRequestItem = ({ item }: { item: PurchaseRequest }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.requestItem}>
        <SingleItem item={item.listing} source="purchaseRequests" />
        <View style={styles.requestInfo}>
          {activeTab === "sent" && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: "#555" }}>
                Seller:{" "}
                <Text style={{ fontWeight: "600" }}>{item.seller_name}</Text>
              </Text>
            </View>
          )}
          {activeTab === "received" && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: "#555" }}>
                Requester:{" "}
                <Text style={{ fontWeight: "600" }}>{item.requester_name}</Text>
              </Text>
            </View>
          )}
          <View style={styles.statusContainer}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.requestDate}>{formattedDate}</Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>

          {item.status === "pending" && (
            <View style={styles.actionButtonsContainer}>
              {activeTab === "received" && (
                <>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptRequest(item.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => declineRequest(item.id)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.removeButton,
              { backgroundColor: "red", zIndex: 999 },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              console.log("Delete clicked for", item.id);
              removeRequest(item.id);
            }}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
            <Text style={styles.buttonText}>Delete Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Calculate the position for the animated tab indicator
  const indicatorLeft = tabPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <>
      {/* Stack Screen configuration for the header */}
      <Stack.Screen
        options={{
          headerTitle: "Purchase Requests",
          headerTitleAlign: "center",
          headerShown: true,
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: "#B45757",
          },
          headerTintColor: "#ffffff",
          headerShadowVisible: false,
        }}
      />
      {/* Main container for the component */}
      <View style={styles.container}>
        {/* Tabs for switching between sent and received requests */}
        <View style={styles.tabsOuterContainer}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab("sent")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === "sent" && { color: colors.accent },
                ]}
              >
                Sent Requests
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab("received")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === "received" && { color: colors.accent },
                ]}
              >
                Received Requests
              </Text>
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  backgroundColor: colors.background,
                  left: indicatorLeft,
                },
              ]}
            />
          </View>
        </View>
        {/* Conditional rendering based on loading state */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#4285F4"
              testID="activity-indicator"
            />
          </View>
        ) : (
          /* FlatList to display the list of purchase requests */
          <FlatList
            data={activeTab === "sent" ? sentRequests : receivedRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              /* Refresh control for pull-to-refresh functionality */
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#4285F4"]}
                tintColor="#4285F4"
              />
            }
            /* Component to display when the list is empty */
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>
                  No {activeTab === "sent" ? "Sent" : "Received"} Requests
                </Text>
                <Text style={styles.emptyText}>
                  {activeTab === "sent"
                    ? "You haven't requested to purchase any items yet."
                    : "You don't have any purchase requests for your items."}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
};

export default PurchaseRequests;

/**
 * @constant styles
 * @description StyleSheet for the PurchaseRequests component.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F0",
  },
  tabsOuterContainer: {
    backgroundColor: "#B45757",
    paddingBottom: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabsContainer: {
    flexDirection: "row",
    marginTop: 5,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    position: "relative",
    height: 44,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabIndicator: {
    position: "absolute",
    width: "50%",
    height: "100%",
    borderRadius: 10,
    zIndex: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontWeight: "600",
    fontSize: 15,
  },
  activeTabText: {
    color: "#4285F4",
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  requestItem: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  requestInfo: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestDate: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: "600",
    color: "white",
    fontSize: 13,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  declineButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 5,
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});
