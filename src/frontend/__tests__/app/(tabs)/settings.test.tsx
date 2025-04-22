import ProfileScreen from "@/app/(tabs)/settings";
import { useAuth } from "@/app/contexts/AuthContext";
import { useUserStore } from "@/stores/userStore";
import { render, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import React from "react";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseUserStore = jest.fn();
jest.mock("@/stores/userStore", () => ({
  __esModule: true,
  useUserStore: () => mockUseUserStore(), // this is key
}));
jest.mock("@/components/DangerModal", () => jest.fn().mockReturnValue(null));

describe("ProfileScreen", () => {
  const mockFetchUserData = jest.fn();
  const mockOnLogout = jest.fn();
  const mockRouter = { push: jest.fn() };

  // clear all previous mocks just to be safe
  beforeEach(() => {
    jest.clearAllMocks();
    // mock useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "test-token",
      onLogout: mockOnLogout,
    });

    //mock useUserStore hook
    mockUseUserStore.mockReturnValue({
      //cast as unknown to bypass typescript stuff
      userData: { email: "test@grinnell.edu" },
      isLoading: false,
      error: null,
      fetchUserData: mockFetchUserData,
      updateUserData: jest.fn(),
      clearUserData: jest.fn(),
    });
  });

  it("renders loading state correctly", () => {
    mockUseUserStore.mockReturnValueOnce({
      userData: null,
      isLoading: true,
      error: null,
      fetchUserData: jest.fn(),
      updateUserData: jest.fn(),
      clearUserData: jest.fn(),
    });

    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Loading profile...")).toBeTruthy();
  });

  it("fetches user data on mount when authToken is present", async () => {
    render(<ProfileScreen />);
    await waitFor(() => {
      expect(mockFetchUserData).toHaveBeenCalledWith("test-token");
    });
  });
});
