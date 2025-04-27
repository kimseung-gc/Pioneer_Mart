import React from "react";
import { render } from "@testing-library/react-native";
import { useAuth } from "@/app/contexts/AuthContext"; 
import { useItemsStore } from "@/stores/useSearchStore"; 
import ReportedItemsScreen from "@/app/additionalinfo/ReportedItems";

// Mock child components
jest.mock("@/components/Categories", () => {
  const { View } = require("react-native");
  return () => <View testID="categories" />;
});
jest.mock("@/components/ProductList", () => {
  const { View } = require("react-native");
  return () => <View testID="product-list" />;
});

// Mock auth and store
jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/stores/useSearchStore", () => ({
  useItemsStore: jest.fn(),
}));

describe("ReportedItemsScreen", () => {
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

  it("renders Header, Categories, and ProductList", () => {
    const { getByTestId } = render(<ReportedItemsScreen />);

    expect(getByTestId("categories")).toBeTruthy();
    expect(getByTestId("product-list")).toBeTruthy();
  });
});
