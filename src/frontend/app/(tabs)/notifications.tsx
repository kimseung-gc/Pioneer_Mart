import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { notificationsApi } from "@/services/notificationsApi";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

export type AppNotification = {
  id: number;
  // type: "purchase" | "favorite" | "report";
  type: "purchase" | "chat";
  message: string;
  time: string;
};

// const mockNotifications: Notification[] = [
//   {
//     id: 1,
//     type: "purchase",
//     message: "Alex requested to buy your item 'Bike'",
//     time: "2h ago",
//   },
//   {
//     id: 2,
//     type: "favorite",
//     message: "Lily favorited your item 'Desk Lamp'",
//     time: "4h ago",
//   },
//   {
//     id: 3,
//     type: "report",
//     message: "Your item 'Microwave' was reported",
//     time: "1d ago",
//   },
//   {
//     id: 4,
//     type: "purchase",
//     message: "Ben sent a purchase request for 'Bookshelf'",
//     time: "1d ago",
//   },
// ];

const mockNotifications: AppNotification[] = [
  {
    id: 1,
    type: "purchase",
    message: "Alex requested to buy your item 'Bike'",
    time: "2h ago",
  },
  {
    id: 2,
    type: "chat",
    message: "Lily sent a message about 'Desk Lamp'",
    time: "1h ago",
  },
  {
    id: 3,
    type: "purchase",
    message: "Ben sent a purchase request for 'Bookshelf'",
    time: "1d ago",
  },
];
const NotificationIcon = ({ type }: { type: AppNotification["type"] }) => {
  const iconProps = {
    purchase: { name: "shopping-cart", color: "#4CAF50" },
    // favorite: { name: "favorite", color: "#E91E63" },
    // report: { name: "report-problem", color: "#F44336" },
    chat: { name: "chat", color: "#2196F3" },
  }[type];

  return (
    <MaterialIcons
      name={iconProps.name as any}
      size={24}
      color={iconProps.color}
      style={styles.icon}
    />
  );
};

const NotificationCard = ({ item }: { item: AppNotification }) => (
  <View style={styles.card}>
    <NotificationIcon type={item.type} />
    <View style={styles.messageContainer}>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  </View>
);

export default function NotificationsScreen() {
  const screenId = "notifications";
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { authToken } = useAuth();

  const fetchNotifications = async (type = filterType) => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications("all", authToken);
      setNotifications(data);
      console.log("hello", data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to load notifications",
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await fetchNotifications();
        try {
          await notificationsApi.resetUnreadCount(authToken);
        } catch (error) {
          Toast.show({
            type: "error",
            text1: "Failed to mark notifications as read",
          });
        }
      };
      loadData();
    }, [])
  );

  useEffect(() => {
    fetchNotifications(filterType);
  }, [filterType]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(filterType);
    setRefreshing(false);
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
  };

  const filteredNotifications = useMemo(() => {
    return filterType === "all"
      ? notifications
      : notifications.filter((n) => n.type === filterType);
  }, [filterType, notifications]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <Header screenId={screenId} />,
        }}
      />

      <View style={styles.filterContainer}>
        {["all", "purchase", "chat"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => handleFilterChange(type)}
            style={[
              styles.filterButton,
              filterType === type && styles.activeFilterButton,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filterType === type && styles.activeFilterText,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="007BFF" />
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NotificationCard item={item} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications to show.</Text>
          }
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ top: 0, bottom: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#007BFF"]}
            />
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    color: "#333",
  },
  time: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 60,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeFilterButton: {
    backgroundColor: "#007BFF",
  },
  filterText: {
    fontSize: 14,
    color: "#333",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
});
