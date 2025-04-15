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
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { BASE_URL } from "@/config";
import axios from "axios";
import SingleItem from "@/components/SingleItem";
import React from "react";

const PurchaseRequests = () => {
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
      const sentResponse = await axios.get(`${BASE_URL}/api/requests/sent/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const receivedResponse = await axios.get(
        `${BASE_URL}/api/requests/received/`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      // Filter active requests only
      setSentRequests(
        sentResponse.data.filter((req: PurchaseRequest) => req.is_active)
      );
      setReceivedRequests(
        receivedResponse.data.filter((req: PurchaseRequest) => req.is_active)
      );
    } catch (error) {
      console.error("Error fetching purchase requests:", error);
      alert("Failed to load purchase requests. Please try again later");
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
   * @function cancelRequest
   * @async
   * @param {number} requestId - The ID of the purchase request to cancel.
   * @description Sends a request to the backend API to cancel a specific purchase request.
   * Upon successful cancellation, it updates the local `sentRequests` state to remove the cancelled request.
   * Handles potential errors during the cancellation process.
   */
  const cancelRequest = async (requestId: number) => {
    try {
      const cleanToken = authToken?.trim();
      await axios.post(
        `${BASE_URL}/api/requests/${requestId}/cancel/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
            Accept: "application/json",
          },
        }
      );

      // Update the local state to remove the cancelled request
      setSentRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
      alert("Purchase request cancelled successfully");
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert("Failed to cancel purchase request. Please try again later.");
    }
  };

  /**
   * @function renderRequestItem
   * @param {object} { item } - An object containing the `PurchaseRequest` item to render.
   * @returns {JSX.Element} - A View component representing a single purchase request item in the list.
   * @description Renders a single purchase request item, displaying the associated listing details and the request date.
   * For sent requests, it also includes a "Cancel" button.
   */
  const renderRequestItem = ({ item }: { item: PurchaseRequest }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString();

    return (
      <View style={styles.requestItem}>
        <SingleItem item={item.listing} source="purchaseRequests" />
        <View style={styles.requestInfo}>
          <Text style={styles.requestDate}>
            Requested on: {new Date(item.created_at).toLocaleDateString()}
          </Text>
          {activeTab === "sent" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelRequest(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
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
          headerLeft: () => (
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => router.back()}
            >
              <Entypo name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
          ),
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
            <ActivityIndicator size="large" color="blue" />
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
  cancelButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "500",
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
