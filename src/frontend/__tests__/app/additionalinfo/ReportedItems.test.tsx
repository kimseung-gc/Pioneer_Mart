import React from "react";
import { render } from "@testing-library/react-native";
import { useAuth } from "@/app/contexts/AuthContext"; 
import { useItemsStore } from "@/stores/useSearchStore"; 
import ReportedItemsScreen from "@/app/additionalinfo/ReportedItems";

// Mock child components with testIDs
jest.mock("@/components/Categories", () => {
  const { View } = require("react-native");
  return () => <View testID="categories" />;
});
jest.mock("@/components/ProductList", () => {
  const { View } = require("react-native");
  return () => <View testID="product-list" />;
});

// Mock auth context and items store
jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/stores/useSearchStore", () => ({
  useItemsStore: jest.fn(),
}));

// Test suite for ReportedItemsScreen
describe("ReportedItemsScreen", () => {
  // Setup mock return values before each test
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "fake-token",
    });

    (useItemsStore as jest.Mock).mockReturnValue({
      screens: {
        reported: {
          filteredItems: [],
          isLoading: false,
        },
      },
      setActiveScreen: jest.fn(),
      loadItems: jest.fn(),
      loadCategories: jest.fn(),
      categories: [],
    });
  });

  it("renders Categories and ProductList", () => {
    // Render the ReportedItemsScreen
    const { getByTestId } = render(<ReportedItemsScreen />);

    // Verify that Categories and ProductList components are rendered
    expect(getByTestId("categories")).toBeTruthy();
    expect(getByTestId("product-list")).toBeTruthy();
  });
});
