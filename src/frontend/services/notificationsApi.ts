import { AppNotification } from "@/app/(tabs)/notifications";
import api, { PaginatedResponse } from "@/types/api";
import Constants from "expo-constants";

const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
export const notificationsApi = {
  getNotifications: async (type = "all", token: string | null) => {
    // const response = await api.get(`/notifications/?type=${type}`);
    const response = await api.get<PaginatedResponse<AppNotification>>(
      `${BASE_URL}/api/notifications/?type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${token?.trim()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data.results;
  },
  resetUnreadCount: async (token: string | null) => {
    const response = await api.post(
      `${BASE_URL}/api/notifications/reset_unread_count/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token?.trim()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
  },
  getUnreadCount: async (token: string | null) => {
    const response = await api.get(
      `${BASE_URL}/api/notifications/unread_count/`,
      {
        headers: {
          Authorization: `Bearer ${token?.trim()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data.unread_count;
  },
};
