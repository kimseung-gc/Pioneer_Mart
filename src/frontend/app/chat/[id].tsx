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
  const [messages, setMessages] = useState<Message[]>([]); // state for all messagees in the chat
  const [messageText, setMessageText] = useState<string>(""); // state for the actual content of a message
  const [connected, setConnected] = useState<boolean>(false); // state for whether websocket is connected
  const ws = useRef<WebSocket | null>(null); // react ref for websocket needed for chatting w/ persistent connection
  const flatListRef = useRef<FlatList | null>(null); // react ref for interacting with FlatList
  const authToken = useAuth(); // auth token
  const { userData } = useUserStore(); //userData from user store

  useEffect(() => {
    // connect to websocket
    setMessages([]);
    let socketUrl = "";
    const baseUrlObj = new URL(BASE_URL);
    const host = baseUrlObj.host; // this includes hostname and port

    // construct WebSocket URL with trailing slash
    socketUrl = `ws://${host}/ws/chat/${roomId}/`;

    //setup event handlers for websocket connection
    ws.current = new WebSocket(socketUrl);
    ws.current.onopen = () => {
      setConnected(true); //socket now connected
    };
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data) as WebSocketMessage;
      console.log("Received message:", data); // debug the incoming data
      // update state for messages when user receives a message
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

    // once event handlers are setup, fetch chat history & mark room
    // as read cause we're already in chat room
    fetchChatHistory();
    markRoomAsRead();

    // this return is essentially a cleanup function. React will
    // automatically call this if roomId changes or the component unmounts
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      setMessages([]);
    };
  }, [roomId]); // this hook runs whenever roomId changes. In other words, whenever the user navigates to a new chat room

  const markRoomAsRead = async (): Promise<void> => {
    try {
      const cleanToken = authToken.authToken?.trim();
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
    } catch (error) {
      console.error("Error marking room as read:", error);
    }
  };

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

    // send a message
    ws.current.send(JSON.stringify(messageData));
    setMessageText("");
  };

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => {
    // this might seem useless but my stupid ass messed up the
    // chat.ts types and have been working with those so now we
    // need to convert all id's to string to use them w/ the backend
    const currentUserId = userData?.id?.toString();
    const messageUserId = item.userId?.toString();

    // check if message is sent by user for UI stuff
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
          headerTitle: () => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: `/item/[id]`,
                  params: { id: id.toString() },
                })
              }
            >
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {roomName} - {item}
              </Text>
            </TouchableOpacity>
          ),
          headerTitleAlign: "center",
          headerBackTitle: "Back",
        }}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
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
