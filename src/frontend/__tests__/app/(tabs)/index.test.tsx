import HomeScreen from "@/app/(tabs)";
import { useAuth } from "@/app/contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock the child components
jest.mock("@/components/Header", () => () => <></>);
jest.mock("@/components/Categories", () => () => <></>);
jest.mock("@/components/ProductList", () => () => <></>);

// Mocking the hooks
jest.mock("@/stores/useSearchStore");
jest.mock("@/app/contexts/AuthContext");

// Just had to add this cause Stack.Screen relies on expo-router. This will just sit here doing nothing
jest.mock("expo-router", () => ({
  Stack: {
    Screen: () => null, // mock out Stack.Screen
  },
}));

// All the home screen stuff
describe("HomeScreen", () => {
  const mockSetActiveScreen = jest.fn();
  const mockLoadItems = jest.fn();
  const mockLoadCategories = jest.fn();
  const mockRefreshItems = jest.fn();
  const mockSetIsReturningFromDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default return values for useItemsStore
    (useItemsStore as unknown as jest.Mock).mockReturnValue({
      screens: {
        home: {
          filteredItems: [],
          isLoading: false,
        },
      },
      setActiveScreen: mockSetActiveScreen,
      loadItems: mockLoadItems,
      loadCategories: mockLoadCategories,
      refreshItems: mockRefreshItems,
      setIsReturningFromDetails: mockSetIsReturningFromDetails,
      isReturningFromDetails: false,
      categories: [],
    });

    // Set return value for useAuth
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "test-token",
    });
  });

  it("renders Header, Categories, and ProductList", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(mockSetActiveScreen).toHaveBeenCalledWith("home");
      expect(mockLoadItems).toHaveBeenCalledWith("home", "test-token");
      expect(mockLoadCategories).toHaveBeenCalledWith("test-token");
    });
  });

  it("does not crash without authToken", async () => {
    (useAuth as jest.Mock).mockReturnValueOnce({ authToken: null });

    render(<HomeScreen />);
    await waitFor(() => {
      expect(mockLoadItems).toHaveBeenCalledWith("home", "");
      expect(mockLoadCategories).toHaveBeenCalledWith("");
    });
  });
});
