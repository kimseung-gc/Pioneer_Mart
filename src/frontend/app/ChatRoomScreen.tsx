import { useUserStore } from "@/stores/userStore";
import { ChatRoom, ChatRoomsScreenRouteParams } from "@/types/chat";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import axios from "axios";
import { BASE_URL } from "@/config";
import {
  Alert,
  Text,
  ListRenderItemInfo,
  TouchableOpacity,
  StyleSheet,
  View,
  Touchable,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
type RootStackParamList = {
  ChatRooms: ChatRoomsScreenRouteParams;
  Chat: {
    roomId: string;
    roomName: string;
  };
};

type ChatRoomsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ChatRooms"
>;
type ChatRoomsScreenRouteProp = RouteProp<RootStackParamList, "ChatRooms">;

interface Props {
  navigation: ChatRoomsScreenNavigationProp;
  route: ChatRoomsScreenRouteProp;
}

const ChatRoomsScreen: React.FC<Props> = ({ navigation }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>("");
  const { userData } = useUserStore();
  const authToken = useAuth();
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (): Promise<void> => {
    try {
      const cleanToken = authToken.authToken?.trim();
      const response = await axios.get(`${BASE_URL}/api/chat/rooms/`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = response.data;
      setRooms(data.rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const enterRoom = (room: ChatRoom): void => {
    // console.log("entering room:", room.id, room.user1, room.user2);
    if (!userData?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const otherUser = userData.id === room.user1.id ? room.user2 : room.user1;
    // Use router.push instead of navigation.navigate
    router.push({
      pathname: "/chat/[id]",
      params: { id: room.id.toString(), name: otherUser.username },
    });
  };

  const renderRoom = ({ item }: ListRenderItemInfo<ChatRoom>) => {
    const otherUser = userData?.id === item.user1.id ? item.user2 : item.user1;
    return (
      <TouchableOpacity style={styles.roomItem} onPress={() => enterRoom(item)}>
        <Text style={styles.roomName}>{otherUser.username}</Text>
        <Text style={styles.roomDetails}>{item.message_count} messages</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Your Chats",
          headerTitleAlign: "center",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => {
                router.back();
                console.log("navigating back...");
              }}
            >
              <Entypo name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <Text style={styles.title}>Chat Rooms</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createButtonText}>+ New Room</Text>
          </TouchableOpacity>
        </View> */}
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
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create new Room</Text>
              <TextInput
                style={styles.modalInput}
                value={newRoomName}
                onChangeText={setNewRoomName}
                placeholder="Room name"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={[styles.modalButton, styles.createModalButton]}
                  onPress={createRoom}
                >
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </View>
        </Modal>
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
  },
  roomName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  roomDetails: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  createModalButton: {
    backgroundColor: "#007bff",
  },
});

export default ChatRoomsScreen;
