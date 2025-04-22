import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchBar from "./SearchBar";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ScreenId } from "@/types/types";
import { useChatStore } from "@/stores/chatStore";
import { useAuth } from "@/app/contexts/AuthContext";
import { Badge } from "react-native-elements";

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
    }, 60000); // check unread count every minute

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
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {route.name === "additionalinfo/MyItems" ||
      route.name == "additionalinfo/ReportedItems" ? (
        <View style={styles.myItemsContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <Entypo name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.myItemsContainer}>
            <View style={styles.searchContainer}>
              <SearchBar screenId={screenId} />
            </View>
            <View style={styles.iconContainer}>
              <TouchableOpacity
                onPress={handleChatPress}
                style={{ position: "relative" }}
              >
                <Entypo name="chat" size={24} color="black" />
                {unreadCount > 0 && (
                  <Badge
                    value={unreadCount > 99 ? "99+" : unreadCount}
                    status="error"
                    containerStyle={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                    }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.myItemsContainer}>
          <View style={styles.searchContainer}>
            <SearchBar screenId={screenId} />
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={handleChatPress}
              style={{ position: "relative" }}
            >
              <Entypo name="chat" size={24} color="black" />
              {unreadCount > 0 && (
                <Badge
                  value={unreadCount > 99 ? "99+" : unreadCount}
                  status="error"
                  containerStyle={{ position: "absolute", top: -8, right: -8 }}
                />
              )}
            </TouchableOpacity>
          </View>
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
  myItemsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "95%",
  },
  backButton: {
    marginTop: 16,
  },
  searchContainer: {
    flex: 1,
  },
  chatWrapper: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  chatIcon: {
    zIndex: 2, //so that icon stays on the top
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
