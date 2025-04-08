import { useAuth } from "@/app/contexts/AuthContext";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

export const AppInitialier = () => {
  const { authToken, isAuthenticated } = useAuth();
  const { fetchUserData } = useUserStore();

  useEffect(() => {
    const initializeApp = async () => {
      if (isAuthenticated && authToken) {
        try {
          await fetchUserData(authToken);
          console.log("User data fetched successfully");
        } catch (error) {
          console.log("Failed to fetch user data");
        }
      }
    };
    initializeApp();
  }, [isAuthenticated, authToken]);
  return null;
};
