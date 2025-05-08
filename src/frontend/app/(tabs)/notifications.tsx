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
import { useNotification } from "../contexts/NotificationContext";
import { useTheme } from "../contexts/ThemeContext";

export type AppNotification = {
  id: number;
  type: "purchase" | "chat";
  message: string;
  time: string;
};

const NotificationIcon = ({ type }: { type: AppNotification["type"] }) => {
  const { colors } = useTheme();

  const iconProps = {
    purchase: { name: "shopping-cart", color: colors.accent },
    chat: { name: "chat", color: colors.accent },
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

const NotificationCard = ({ item, colors }: { item: AppNotification; colors: any }) => (
  <View style={[styles.card, { borderBottomColor: colors.border }]}>
    <NotificationIcon type={item.type} />
    <View style={styles.messageContainer}>
      <Text style={[styles.message, { color: colors.textPrimary }]}>{item.message}</Text>
      <Text style={[styles.time, { color: colors.textSecondary }]}>{item.time}</Text>
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
  const { resetUnreadCount } = useNotification();
  const { colors } = useTheme();

  const fetchNotifications = async (type = filterType) => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications("all", authToken);
      setNotifications(data);
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
        resetUnreadCount();
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

      <View style={[styles.filterContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {["all", "purchase", "chat"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => handleFilterChange(type)}
            style={[
              styles.filterButton,
              { backgroundColor: colors.background },
              filterType === type && { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.textPrimary },
                filterType === type && { color: colors.card, fontWeight: "600" },
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <NotificationCard item={item} colors={colors} />}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.textSecondary }]}>
                No notifications to show.
              </Text>
            }
            contentContainerStyle={styles.listContent}
            scrollIndicatorInsets={{ top: 0, bottom: 0 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.accent]}
              />
            }
          />
        )}
      </View>
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
  },
  time: {
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    textAlign: "center",
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
    borderBottomWidth: 1,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
  },
});
