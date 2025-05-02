import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchBar from "./SearchBar";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ScreenId } from "@/types/types";
import { useChatStore } from "@/stores/chatStore";
import { useAuth } from "@/app/contexts/AuthContext";
import { Badge } from "react-native-paper";

type HeaderProps = {
  screenId: ScreenId;
};

const Header: React.FC<HeaderProps> = ({ screenId }) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { unreadCount, fetchUnreadCount } = useChatStore();
  const { authToken } = useAuth();

  useEffect(() => {
    if (authToken) {
      fetchUnreadCount(authToken);
    }
    const intervalId = setInterval(() => {
      fetchUnreadCount(authToken);
    }, 120000); // check unread count every minute

    return () => clearInterval(intervalId);
  }, [authToken]); //runs when authToken changes

  // Refresh unread count when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (authToken) {
        fetchUnreadCount(authToken);
      }
      return () => {};
    }, [authToken])
  );

  const handleChatPress = () => {
    router.push("/ChatRoomScreen");
  };

  const isNotificationScreen = screenId === "notifications";
  const showBackButton =
    route.name === "additionalinfo/MyItems" ||
    route.name === "additionalinfo/ReportedItems";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {showBackButton ? (
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <Entypo name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.row}>
            {!isNotificationScreen && (
              <View style={styles.searchContainer}>
                <SearchBar screenId={screenId} />
              </View>
            )}
            <TouchableOpacity onPress={handleChatPress} style={styles.chatWrapper}>
              <Entypo name="chat" size={24} color="black" />
              {unreadCount > 0 && (
                <Badge style={styles.badge} size={18}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : isNotificationScreen ? (
        <View style={styles.titleRow}>
          <View style={{ width: 24 }} /> {/* Left spacer for symmetry */}
          <Text style={styles.titleText}>Notifications</Text>
          <TouchableOpacity onPress={handleChatPress} style={styles.chatWrapper}>
            <Entypo name="chat" size={24} color="black" />
            {unreadCount > 0 && (
              <Badge style={styles.badge} size={18}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.searchContainer}>
            <SearchBar screenId={screenId} />
          </View>
          <TouchableOpacity onPress={handleChatPress} style={styles.chatWrapper}>
            <Entypo name="chat" size={24} color="black" />
            {unreadCount > 0 && (
              <Badge style={styles.badge} size={18}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  chatWrapper: {
    width: 24,
    alignItems: "flex-end",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "red",
    color: "white",
    fontSize: 10,
  },
  backButton: {
    marginTop: 16,
  },
});
