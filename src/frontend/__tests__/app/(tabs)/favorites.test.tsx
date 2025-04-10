import React from "react";
import { render, waitFor } from "@testing-library/react-native";
// import { favorites } from "../../../app/(tabs)/favorites";
import FavoritesScreen  from "../../../app/(tabs)/favorites";
import { useAuth } from "../../../app/contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";

// Mock subcomponents to avoid deep renders
jest.mock("expo-router", () => ({
  Stack: {
    Screen: () => null,
  },
}));

jest.mock("@/components/Header", () => () => <></>);
jest.mock("@/components/Categories", () => () => <></>);
jest.mock("@/components/ProductList", () => () => <></>);

// Mock hooks
jest.mock("../../../app/contexts/AuthContext");
jest.mock("@/stores/useSearchStore");

describe("FavoritesScreen", () => {
  const mockSetActiveScreen = jest.fn();
  const mockLoadItems = jest.fn();
  const mockLoadCategories = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      authToken: "test-token",
    });

    (useItemsStore as jest.Mock).mockReturnValue({
      screens: {
        favorites: {
          filteredItems: [{ id: 1, title: "Test Item" }],
          isLoading: false,
        },
      },
      categories: [{ id: 1, name: "Category 1" }],
      setActiveScreen: mockSetActiveScreen,
      loadItems: mockLoadItems,
      loadCategories: mockLoadCategories,
    });
  });

  it("renders without crashing and calls required data loaders", async () => {
    render(<FavoritesScreen />);

    await waitFor(() => {
      expect(mockSetActiveScreen).toHaveBeenCalledWith("favorites");
      expect(mockLoadItems).toHaveBeenCalledWith("favorites", "test-token");
      expect(mockLoadCategories).toHaveBeenCalledWith("test-token");
    });
  });
});
