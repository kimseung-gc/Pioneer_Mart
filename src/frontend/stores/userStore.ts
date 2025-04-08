import { create } from "zustand";
import { UserInfo } from "@/types/types";
import axios from "axios";
import { BASE_URL } from "@/config";
import { PaginatedResponse } from "@/types/api";

interface UserState {
  userData: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  fetchUserData: (token: string) => Promise<UserInfo[] | undefined>;
  updateUserData: (userData: Partial<UserInfo>, token: string) => Promise<void>;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  userData: null,
  isLoading: false,
  error: null,

  fetchUserData: async (token: string) => {
    try {
      set({ isLoading: true, error: null });
      const cleanToken = token?.trim();
      const URL = `${BASE_URL}/api/users/`;
      const response = await axios.get<PaginatedResponse<UserInfo>>(URL, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (response.data.results) {
        console.log("User data:", response.data.results);
        set({ userData: response.data.results[0], isLoading: false });
        return response.data.results;
      } else {
        console.error("No user data found in the response.");
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load profile data",
        isLoading: false,
      });
      throw error;
    }
  },

  updateUserData: async (updatedData: Partial<UserInfo>, token: string) => {
    try {
      set({ isLoading: true, error: null });
      const userData = get().userData;
      if (!userData || !userData.id) {
        throw new Error("No user data available to update");
      }
      const cleanToken = token?.trim();
      const URL = `${BASE_URL}/api/users/${userData.id}/`;
      const response = await axios.patch(URL, updatedData, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
        },
      });
      set({
        userData: { ...userData, ...response.data },
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user data:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update user data",
        isLoading: false,
      });
    }
  },

  clearUserData: () => {
    set({ userData: null, error: null });
  },
}));
