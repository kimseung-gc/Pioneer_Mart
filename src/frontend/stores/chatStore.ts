import { create } from "zustand";
import axios from "axios";
import Constants from "expo-constants";
import api from "@/types/api";

const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;

interface ChatState {
  unreadCount: number;
  isLoading: boolean;
  fetchUnreadCount: (token: string | null) => Promise<void>;
  resetUnreadCount: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  unreadCount: 0,
  isLoading: false,

  fetchUnreadCount: async (token: string | null) => {
    if (!token) return; //no token so we don't get any chats
    try {
      set({ isLoading: true });
      const cleanToken = token.trim();
      const response = await api.get(`${BASE_URL}/api/chat/unread-count/`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      set({ unreadCount: response.data.unread_count, isLoading: false });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      set({ isLoading: false });
    }
  },
  resetUnreadCount: () => {
    set({ unreadCount: 0 });
  },
}));
