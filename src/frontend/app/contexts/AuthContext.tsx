// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Constants from "expo-constants";
import api from "@/types/api";

export type AuthContextType = {
  authToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string | null, refresh: string | null) => void;
  isAuthenticated: boolean;
  onLogout: () => Promise<void>; //promise to log user out...going to use it with await
  refreshAccessToken: () => Promise<boolean>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Load token from storage when the app starts
    const loadTokens = async () => {
      try {
        const storedAuthToken = await AsyncStorage.getItem("authToken");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
        if (storedAuthToken && storedRefreshToken) {
          setAuthToken(storedAuthToken);
          setRefreshToken(storedRefreshToken);
          setIsAuthenticated(true); //ensure auth state updates
        }
      } catch (error) {
        console.error("Failed to load auth tokens", error);
      } finally {
        setLoading(false);
      }
    };
    loadTokens();
  }, []);

  const setTokens = async (access: string | null, refresh: string | null) => {
    try {
      if (access && refresh) {
        await AsyncStorage.setItem("authToken", access);
        await AsyncStorage.setItem("refreshToken", refresh);
        setAuthToken(access);
        setRefreshToken(refresh);
        setIsAuthenticated(true);
      } else {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("refreshToken");
        setAuthToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to set tokens", error);
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken) return false;
    try {
      const response = await api.post(
        `${Constants?.expoConfig?.extra?.apiUrl}/auth/refresh/`,
        { refresh: refreshToken }
      );
      const { access, refresh: newRefresh } = response.data;
      await setTokens(access, newRefresh || refreshToken);
      return true;
    } catch (error) {
      console.error("Failed to refresh token", error);
      await onLogout();
      return false;
    }
  };

  const onLogout = async () => {
    try {
      await setTokens(null, null);
      router.replace("/(auth)");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        refreshToken,
        setTokens,
        isAuthenticated: !!authToken,
        loading,
        onLogout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context as AuthContextType; //type assertion to prevent undefined error
};

// export default AuthProvider;

export default function AuthContextComponent() {
  return <></>; //satisfy the requirement for a component with empty fragment
}
