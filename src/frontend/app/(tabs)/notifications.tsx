import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "@/components/Header";

type Notification = {
  id: number;
  type: "purchase" | "favorite" | "report";
  message: string;
  time: string;
};

const mockNotifications: Notification[] = [
  { id: 1, type: "purchase", message: "Alex requested to buy your item 'Bike'", time: "2h ago" },
  { id: 2, type: "favorite", message: "Lily favorited your item 'Desk Lamp'", time: "4h ago" },
  { id: 3, type: "report", message: "Your item 'Microwave' was reported", time: "1d ago" },
];

const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  const iconProps = {
    purchase: { name: "shopping-cart", color: "#4CAF50" },
    favorite: { name: "favorite", color: "#E91E63" },
    report: { name: "report-problem", color: "#F44336" },
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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <Header screenId={screenId} />,
        }}
      />
        <FlatList
          data={mockNotifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NotificationCard item={item} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet!</Text>
          }
          contentContainerStyle={styles.listContent} 
          scrollIndicatorInsets={{ top: 0, bottom: 0 }}
        />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
});
