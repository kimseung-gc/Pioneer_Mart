import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ItemDetails from "@/app/item/[id]";
import { useUserStore } from "@/stores/userStore";
import { useAuth } from "@/app/contexts/AuthContext";
import { ItemType } from "@/types/types";
import Constants from "expo-constants";
import api from "@/types/api";

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
  const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
  const mockItem: ItemType = {
    id: 1,
    title: "Test Item",
    description: "Test Description",
    price: 10.0,
    is_sold: false,
    category: 1,
    is_favorited: false,
    is_reported: false,
    seller: 5,
    image: "https://example.com/image.jpg",
    additional_images: ["https://example.com/additional1.jpg"],
    created_at: "May 1, 2025",
    category_name: "Test Category",
    purchase_requesters: [],
    purchase_request_count: 0,
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

    // Mock api
    (api.get as jest.Mock).mockImplementation((url) => {
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

    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
  });

  it("renders loading state initially", async () => {
    render(<ItemDetails />);
    await waitFor(() => {
      expect(screen.getByTestId("activity-indicator")).toBeTruthy();
    });
  });
  it("renders item details after loading", async () => {
    render(<ItemDetails />);

    await waitFor(() => {
      expect(screen.getByText(`$${mockItem.price}`)).toBeTruthy();
      expect(screen.getByText(`${mockItem.title}`)).toBeTruthy();
      expect(screen.getByText(`${mockItem.description}`)).toBeTruthy();
      expect(screen.getByText(`${mockItem.created_at}`)).toBeTruthy();
      expect(screen.getByText(`${mockItem.category_name}`)).toBeTruthy();
    });
  });
  it("shows edit button when user is the owner", async () => {
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      userData: { ...mockUserData, id: mockItem.seller },
    });

    render(<ItemDetails />);

    await waitFor(() => {
      expect(screen.getByText("Edit Listing")).toBeTruthy();
    });
  });
  it("hides edit button when user is not the owner", async () => {
    render(<ItemDetails />);

    await waitFor(() => {
      expect(screen.queryByText("Edit Listing")).toBeNull();
    });
  });
  it("shows purchase request button when user is not the owner", async () => {
    render(<ItemDetails />);

    await waitFor(() => {
      expect(screen.getByText("Request Purchase")).toBeTruthy();
    });
  });
  it("hides purchase request button when source is myItems", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: "1",
      item: JSON.stringify(mockItem),
      source: "myItems",
    });

    render(<ItemDetails />);

    await waitFor(() => {
      expect(screen.queryByText("Request Purchase")).toBeNull();
    });
  });
  it("submits purchase request when button is clicked", async () => {
    render(<ItemDetails />);
    const button = await waitFor(() => screen.getByText("Request Purchase"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `${BASE_URL}/api/items/${mockItem.id}/request_purchase/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${mockAuthToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
    });
  });
  it("shows disabled button when purchase already requested", async () => {
    // let this complete its cycle before moving on
    (useFocusEffect as jest.Mock).mockImplementation((callback) => {
      callback();
      return () => {};
    });
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockItem });

    const utils = render(<ItemDetails />);

    await waitFor(() => {
      expect(screen.getByText("Request Purchase")).toBeTruthy();
    });
    //simulate navigating away
    utils.unmount();
    mockItem.purchase_request_count = 1;
    mockItem.purchase_requesters = [mockUserData];

    //re mock api to reflect updated data
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockItem });

    render(<ItemDetails />);
    await waitFor(() => {
      expect(screen.getByText("Purchase Requested")).toBeTruthy();
    });
  });
});
