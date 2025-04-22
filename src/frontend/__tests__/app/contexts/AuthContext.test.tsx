// Test suite for AuthContext

import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";

// This is to temporarily suppress the act warning
const originalConsoleError = console.error;
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation((msg, ...args) => {
    if (typeof msg === "string" && msg.includes("not wrapped in act")) {
      return;
    }
    originalConsoleError(msg, ...args);
  });
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe("AuthContext", () => {
  //ensure all mock functions are cleared before testing...prevent state from leading bw tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // this is for ensuring the user is unauthenticated initially
  it("initializes with null authToken and false isAuthenticated", async () => {
    // when authToken should be null while user isn't authenticated
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null); //set getItem to null
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.authToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  //this is just for loading the token
  it("loads token from AsyncStorage on initialization", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("test-token"); //set the token ourselves
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("authToken"); //get token check
      expect(result.current.authToken).toBe("test-token"); //check token
      expect(result.current.isAuthenticated).toBe(true); //check if authenticated
    });
  });

  //this is for loading and then updating when setAuthToken is called
  it("updates authentication state when setAuthToken is called", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.setAuthToken("new-token"); //setting new token
    });
    expect(result.current.authToken).toBe("new-token"); //check if updated token
    expect(result.current.isAuthenticated).toBe(true); //isAuthenticated is now true
  });

  it("logs out user and redireccts to authscreen", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.onLogout(); //await onLogout function to complete
    });
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("authToken"); //remove token
    expect(result.current.authToken).toBeNull(); //check if null
    expect(result.current.isAuthenticated).toBe(false); //isAuthenticated is false
    expect(router.replace).toHaveBeenCalledWith("/(auth)"); //check if routing to (auth)
  });
});
