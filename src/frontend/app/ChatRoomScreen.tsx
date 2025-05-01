import { useUserStore } from "@/stores/userStore";
import { ChatRoom, ChatRoomsScreenRouteParams } from "@/types/chat";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import axios from "axios";
import {
  Alert,
  Text,
  ListRenderItemInfo,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
} from "react-native";
import React from "react";
import { EvilIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useChatStore } from "@/stores/chatStore";
import { useAuth } from "./contexts/AuthContext";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";

type RootStackParamList = {
  ChatRooms: ChatRoomsScreenRouteParams;
  Chat: {
    roomId: string;
    roomName: string;
  };
};

// type ChatRoomsScreenNavigationProp = StackNavigationProp<
//   RootStackParamList,
//   "ChatRooms"
// >;
type ChatRoomsScreenRouteProp = RouteProp<RootStackParamList, "ChatRooms">;

interface Props {
  // navigation: ChatRoomsScreenNavigationProp;
  route: ChatRoomsScreenRouteProp;
}

const ChatRoomsScreen: React.FC<Props> = ({}) => {
  const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { userData } = useUserStore();
  const { authToken } = useAuth();
  const { fetchUnreadCount } = useChatStore(); //for unread messages

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
      return () => {};
    }, [])
  );

  const fetchRooms = async (): Promise<void> => {
    try {
      const cleanToken = authToken?.trim();
      const response = await axios.get(`${BASE_URL}/api/chat/rooms/`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = response.data;

      // Sort the rooms by last message time (i.e. newest first)
      const sortedRooms = data.rooms.sort((a: ChatRoom, b: ChatRoom) => {
        if (!a.last_message_time || !b.last_message_time) return 0;
        return (
          new Date(b.last_message_time).getTime() -
          new Date(a.last_message_time).getTime()
        );
      });
      setRooms(sortedRooms);
      if (authToken) {
        fetchUnreadCount(authToken); // get the unread count with the chat rooms
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await fetchRooms();
    setIsRefreshing(false);
  };

  const markRoomAsRead = async (roomId: number): Promise<void> => {
    try {
      const cleanToken = authToken?.trim();
      await axios.post(
        `${BASE_URL}/api/chat/rooms/${roomId}/mark-read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      // set the unread_count for a room as 0 to mark it as read
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId.toString() ? { ...room, unread_count: 0 } : room
        )
      );

      if (authToken) {
        fetchUnreadCount(authToken); // update unread count once we make the room as read
      }
    } catch (error) {
      console.error("Error marking room as read:", error);
    }
  };

  const enterRoom = (room: ChatRoom): void => {
    if (!userData?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }
    // figure out who's sending the messages for UI stuff
    const otherUser = userData.id === room.user1.id ? room.user2 : room.user1;

    // if there are unread messages in this room, mark them as read
    if (room.unread_count && room.unread_count > 0) {
      markRoomAsRead(Number(room.id));
    }

    // navigate to the chat room
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: room.id.toString(),
        username: otherUser.username,
        itemTitle: room.item_title || "No item",
      },
    });
  };

  const handleDeleteRoom = async (roomId: number) => {
    try {
      const cleanToken = authToken?.trim();
      await axios.delete(`${BASE_URL}/api/chat/rooms/${roomId}/delete/`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
        },
      });

      // update UI after deletion
      setRooms((prevRooms) =>
        prevRooms.filter((room) => Number(room.id) !== roomId)
      );
      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: "Chat room deleted successfully",
      });
      if (authToken) {
        fetchUnreadCount(authToken);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      Alert.alert("Error", "Failed to delete the chat room.");
    }
  };

  const renderRoom = ({ item }: ListRenderItemInfo<ChatRoom>) => {
    // figure out who's sending the messages for UI stuff
    const otherUser = userData?.id === item.user1.id ? item.user2 : item.user1;
    const confirmDelete = () => {
      Alert.alert(
        "Delete Chat Room",
        "Are you sure you want to delete this chat room?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => handleDeleteRoom(Number(item.id)),
          },
        ]
      );
    };
    return (
      <View style={styles.roomItem}>
        <TouchableOpacity
          style={styles.roomContent}
          onPress={() => enterRoom(item)}
        >
          <Text style={styles.roomName}>{otherUser.username}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.roomDetails}>
              {item.item_title ? `Item: ${item.item_title}` : "No item"}
            </Text>
            <Text style={styles.roomDetails}> | </Text>
            <Text style={styles.roomDetails}>
              {item.message_count} messages
            </Text>
          </View>
        </TouchableOpacity>
        {/* Delete button */}
        {Number(item.unread_count) > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        )}
        <TouchableOpacity onPress={confirmDelete}>
          <EvilIcons name="trash" size={28} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Your Chats",
          headerBackTitle: "Back",
          headerTitleAlign: "center",
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={rooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item?.id.toString()}
          style={styles.roomList}
          contentContainerStyle={
            rooms.length === 0 ? styles.emptyList : undefined
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Chat rooms available</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#4caf50"]}
              tintColor="#4caf50"
            />
          }
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  roomList: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
  roomItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  roomDetails: {
    fontSize: 14,
    color: "#888",
  },
  roomContent: {
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: "#2196f3",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  unreadRoom: {
    backgroundColor: "#f0f7ff", // Light blue background for unread messages
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
});

export default ChatRoomsScreen;
