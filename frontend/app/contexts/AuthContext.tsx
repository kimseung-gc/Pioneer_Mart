// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export type AuthContextType = {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  isAuthenticated: boolean;
  onLogout: () => Promise<void>; //promise to log user out...going to use it with await
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load token from storage when the app starts
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          setAuthToken(storedToken);
          setIsAuthenticated(true); //ensure auth state updates
        }
      } catch (error) {
        console.error("Failed to load auth token", error);
      }
    };
    loadToken();
  }, []);

  const onLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setAuthToken(null);
      setIsAuthenticated(false);
      router.replace("/(auth)");
      console.log("User logged out");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        setAuthToken,
        isAuthenticated: !!authToken,
        onLogout,
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

export default function AuthContextComponent() {
  return <></>; //satisfy the requirement for a component with empty fragment
}
