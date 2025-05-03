import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "@/components/Header";

type Notification = {
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

const mockNotifications: Notification[] = [
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
const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
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

const NotificationCard = ({ item }: { item: Notification }) => (
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
  const [filterType, setFilterType] = useState<"all" | "purchase" | "chat">(
    "all"
  );

  const filteredNotifications = useMemo(() => {
    return filterType === "all"
      ? mockNotifications
      : mockNotifications.filter((n) => n.type === filterType);
  }, [filterType]);

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
            onPress={() => setFilterType(type as any)}
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

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <NotificationCard item={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications to show.</Text>
        }
        contentContainerStyle={styles.listContent}
        scrollIndicatorInsets={{ top: 0, bottom: 0 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
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
