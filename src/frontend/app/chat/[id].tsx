import { BASE_URL } from "@/config";
import { Message, WebSocketMessage } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useAuth } from "../contexts/AuthContext";
import { Entypo } from "@expo/vector-icons";

const ChatScreen = () => {
  const { id, name, itemTitle } = useLocalSearchParams();
  const roomId = typeof id === "string" ? id : "";
  const roomName = typeof name === "string" ? name : "Chat Room";
  const item = typeof itemTitle === "string" ? itemTitle : "Item";
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList | null>(null);
  const authToken = useAuth();
  const { userData } = useUserStore();

  useEffect(() => {
    // connect to websocket
    setMessages([]);
    let socketUrl = "";
    const baseUrlObj = new URL(BASE_URL);
    const host = baseUrlObj.host; // This includes hostname and port

    // Construct WebSocket URL with trailing slash
    socketUrl = `ws://${host}/ws/chat/${roomId}/`;
    ws.current = new WebSocket(socketUrl);
    ws.current.onopen = () => {
      setConnected(true); //socket now connected
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data) as WebSocketMessage;
      console.log("Received message:", data); // Debug the incoming data
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Math.random().toString(),
          content: data.message,
          userId: data.user_id ? data.user_id.toString() : "",
          username: data.username || "Unknown",
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    fetchChatHistory();

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      setMessages([]);
    };
  }, [roomId]);

  const fetchChatHistory = async (): Promise<void> => {
    try {
      const cleanToken = authToken.authToken?.trim();
      const response = await axios.get(
        `${BASE_URL}/api/chat/history/${roomId}/`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      // Transform the data to ensure consistent format
      const transformedMessages = response.data.messages.map((msg: any) => ({
        id: msg.id.toString(),
        content: msg.content,
        userId: msg.user?.id?.toString() || "",
        username: msg.user?.username || "Unknown",
        timestamp: msg.timestamp,
      }));
      setMessages(transformedMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const sendMessage = (): void => {
    if (messageText.trim() === "" || !connected || !ws.current) return;

    const messageData: WebSocketMessage = {
      message: messageText,
      user_id: userData?.id,
    };

    ws.current.send(JSON.stringify(messageData));
    setMessageText("");
  };

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => {
    const currentUserId = userData?.id?.toString();
    const messageUserId = item.userId?.toString();

    console.log(
      `Comparing message: ${messageUserId} with current user: ${currentUserId}`
    );
    const isMyMessage = messageUserId === currentUserId;

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.messageUsername}>{item.username}</Text>
        )}
        <Text style={styles.messageContent}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `${roomName} - ${item}`,
          headerTitleAlign: "center",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => {
                router.back();
              }}
            >
              <Entypo name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {/* <View style={styles.header}>
            <Text style={styles.roomName}>Room: {roomName}</Text>
            <View
              style={[
                styles.connectionIndicator,
                connected ? styles.connected : styles.disconnected,
              ]}
            />
          </View> */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item?.id}
            style={styles.messageList}
            onContentSizeChange={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }}
            onLayout={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              autoFocus={false}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!messageText.trim()}
            >
              <Entypo name="paper-plane" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoid: {
    flex: 1,
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
  roomName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  connectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connected: {
    backgroundColor: "green",
  },
  disconnected: {
    backgroundColor: "red",
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "80%",
  },
  myMessageBubble: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  messageUsername: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
