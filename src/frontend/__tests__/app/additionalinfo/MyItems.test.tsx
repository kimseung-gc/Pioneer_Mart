import React from "react";
import { render } from "@testing-library/react-native";
import MyItems from "@/app/additionalinfo/MyItems";
import { useAuth } from "@/app/contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";

// Mock child components with testIDs
jest.mock("@/components/Categories", () => {
  const { View } = require("react-native");
  return () => <View testID="categories" />;
});

jest.mock("@/components/ProductList", () => {
  const { View } = require("react-native");
  return () => <View testID="product-list" />;
});

// Mock context and store
jest.mock("@/app/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/stores/useSearchStore", () => ({ useItemsStore: jest.fn() }));

// Test suite for MyItems screen
describe("MyItems", () => {
  // Set up mock return values before each test
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "fake-token",
    });

    (useItemsStore as jest.Mock).mockReturnValue({
      screens: {
        myItems: {
          filteredItems: [],
          searchQuery: "",
          isLoading: false, // Default to not loading
        },
      },
      setActiveScreen: jest.fn(),
      loadItems: jest.fn(),
      loadCategories: jest.fn(),
      categories: [],
    });
  });

  it("renders Categories and ProductList when not loading", () => {
    // Render MyItems screen
    const { getByTestId } = render(<MyItems />);

    // Check that Categories and ProductList are rendered
    expect(getByTestId("categories")).toBeTruthy();
    expect(getByTestId("product-list")).toBeTruthy();
  });

  it("shows ActivityIndicator when loading", () => {
    // Update mock store to simulate loading
    (useItemsStore as jest.Mock).mockReturnValueOnce({
      screens: {
        myItems: {
          filteredItems: [],
          searchQuery: "",
          isLoading: true, // Set loading to true
        },
      },
      setActiveScreen: jest.fn(),
      loadItems: jest.fn(),
      loadCategories: jest.fn(),
      categories: [],
    });

    // Render MyItems screen
    const { getByTestId } = render(<MyItems />);

    // Check that the loading indicator appears
    expect(getByTestId("loading-indicator")).toBeTruthy();
  });
});