import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";
import axios from "axios";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ItemDetails from "@/app/item/[id]";
import { useUserStore } from "@/stores/userStore";
import { BASE_URL } from "@/config";
import { useAuth } from "@/app/contexts/AuthContext";

// Mock the required dependencies
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
  router: { back: jest.fn(), push: jest.fn() },
  Stack: {
    Screen: () => null,
  },
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/stores/userStore", () => ({
  useUserStore: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn((cb) => cb()),
}));

jest.mock("axios");
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
}));

jest.mock("@expo/vector-icons/Entypo", () => "Entypo");
jest.mock("react-native-gesture-handler", () => ({
  TapGestureHandler: "TapGestureHandler",
}));

jest.mock("@/components/ItemPurchaseModal", () => "ItemPurchaseModal");
jest.mock("@/components/SingleItem", () => "SingleItem");
jest.mock("@/components/ZoomModal", () => "ZoomModal");

describe("ItemDetails Component", () => {
  const mockItem = {
    id: 1,
    title: "Test Item",
    description: "Test Description",
    price: "10.00",
    seller: 5,
    seller_name: "Test Seller",
    image: "https://example.com/image.jpg",
    additional_images: [{ image: "https://example.com/additional1.jpg" }],
    created_at: "2023-01-01",
    category_name: "Test Category",
  };

  const mockUserData = {
    id: 10,
    username: "testuser",
  };

  const mockAuthToken = "test-token";

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock useLocalSearchParams
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: "1",
      item: JSON.stringify(mockItem),
      source: "search",
    });

    // Mock useAuth
    (useAuth as jest.Mock).mockReturnValue({ authToken: mockAuthToken });

    // Mock useUserStore
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      userData: mockUserData,
    });

    // Mock axios
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/api/items/")) {
        return Promise.resolve({ data: mockItem });
      }
      if (url.includes("/api/requests/sent/")) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes("/api/chat/get-or-create-room/")) {
        return Promise.resolve({ data: { room: { id: 123 } } });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
  });

  it("renders loading state initially", async () => {
    render(<ItemDetails />);
    await waitFor(() => {
      expect(screen.getByTestId("activity-indicator")).toBeTruthy();
    });
  });
});
