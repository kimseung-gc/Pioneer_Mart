import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useUserStore } from "@/stores/userStore";
import { router } from "expo-router";
import { TouchableOpacity, Text, View } from "react-native";
import { useAuth } from "@/app/contexts/AuthContext";

const StartChatButton = ({ otherUserId }: { otherUserId: string }) => {
  const [loading, setLoading] = useState(false);
  const authToken = useAuth();
  const { userData } = useUserStore();

  const handleStartChat = async () => {
    setLoading(true);

    try {
      const cleanToken = authToken.authToken?.trim();
      const response = await axios.get(
        `${BASE_URL}/api/chat/get_or_create_room/`,
        {
          params: {
            user_id: otherUserId,
          },
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );
      const { room_id } = response.data;
      if (room_id) {
        // Navigate to the chat room screen
        router.push(`/chat/${room_id}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleStartChat}
        disabled={loading}
        style={{
          backgroundColor: loading ? "gray" : "blue",
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "white" }}>
          {loading ? "Starting Chat..." : "Start Chat"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default StartChatButton;
