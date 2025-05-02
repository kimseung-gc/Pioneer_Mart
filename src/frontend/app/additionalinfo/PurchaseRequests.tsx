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
 * - Tab interface to toggle between "Sent" and "Received" requests
 * - Header navigation with back button using Expo Router
 * - Custom rendering of each item using the <SingleItem /> component
 * - Responsive design and empty state handling
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
import { Entypo } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
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
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import SingleItem from "@/components/SingleItem";
import React from "react";
import Constants from "expo-constants";
import api from "@/types/api";

const PurchaseRequests = () => {
  const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
  // States for PurchaseRequest screen
  const [activeTab, setActiveTab] = useState("sent");
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
      Alert.alert("Failed to load purchase requests. Please try again later");
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
      alert("Purchase request accepted successfully");
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept purchase request. Please try again later");
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
      alert("Purchase request declined successfully");
    } catch (error) {
      console.error("Error declining request:", error);
      alert("Failed to decline purchase request. Please try again later");
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
              alert("Request cancelled & deleted");
            } catch (error) {
              console.error("Error removing request:", error);
              alert("Failed to remove request. Please try again later");
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
    const formattedDate = new Date(item.created_at).toLocaleDateString();
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.requestItem}>
        <SingleItem item={item.listing} source="purchaseRequests" />
        <View style={styles.requestInfo}>
          <View style={styles.statusContainer}>
            <Text style={styles.requestDate}>
              Requested on: {new Date(item.created_at).toLocaleDateString()}
            </Text>
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
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => declineRequest(item.id)}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
          <View style={styles.removeButtonContainer}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeRequest(item.id)}
            >
              <Text style={styles.removeButtonText}>Delete Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <>
      {/* Stack Screen configuration for the header */}
      <Stack.Screen
        options={{
          headerTitle: "Purchase Requests",
          headerTitleAlign: "center",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
      {/* Main container for the component */}
      <View style={styles.container}>
        {/* Tabs for switching between sent and received requests */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "sent" && styles.activeTab]}
            onPress={() => setActiveTab("sent")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "sent" && styles.activeTabText,
              ]}
            >
              Sent Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "received" && styles.activeTab]}
            onPress={() => setActiveTab("received")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "received" && styles.activeTabText,
              ]}
            >
              Received Requests
            </Text>
          </TouchableOpacity>
        </View>
        {/* Conditional rendering based on loading state */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="blue"
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
              />
            }
            /* Component to display when the list is empty */
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No {activeTab === "sent" ? "sent" : "received"} requests
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
    backgroundColor: "#f5f5f5",
  },
  tabsContainer: {
    flexDirection: "row",
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
  },
  activeTab: {
    backgroundColor: "#4285F4",
  },
  tabText: {
    fontWeight: "500",
    color: "#555",
  },
  activeTabText: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 10,
  },
  requestItem: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  requestInfo: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  requestStatus: {
    fontSize: 15,
    marginBottom: 5,
  },
  statusText: {
    fontWeight: "bold",
  },
  requestDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "500",
  },
  declineButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  declineButtonText: {
    color: "white",
    fontWeight: "500",
  },
  removeButtonContainer: {
    alignItems: "flex-end", // aligns child to the right
    marginTop: 10,
  },
  removeButtonText: {
    color: "black",
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
