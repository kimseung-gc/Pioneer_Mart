import React from "react";
import { render } from "@testing-library/react-native";
import MyItems from "@/app/additionalinfo/MyItems";
import { useAuth } from "@/app/contexts/AuthContext"; 
import { useItemsStore } from "@/stores/useSearchStore";


jest.mock("@/components/Categories", () => {
  const { View } = require("react-native");
  return () => <View testID="categories" />;
});

jest.mock("@/components/ProductList", () => {
  const { View } = require("react-native");
  return () => <View testID="product-list" />;
});

jest.mock("@/app/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/stores/useSearchStore", () => ({ useItemsStore: jest.fn() })); 



describe("MyItems", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "fake-token",
    });

    (useItemsStore as jest.Mock).mockReturnValue({
      screens: {
        myItems: {
          filteredItems: [],
          searchQuery: "",
          isLoading: false, 
        },
      },
      setActiveScreen: jest.fn(),
      loadItems: jest.fn(),
      loadCategories: jest.fn(),
      categories: [],
    });
  });

  it("renders Header, Categories, and ProductList when not loading", () => {
    const { getByTestId } = render(<MyItems />);

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
          isLoading: true, 
        },
      },
      setActiveScreen: jest.fn(),
      loadItems: jest.fn(),
      loadCategories: jest.fn(),
      categories: [],
    });

    const { getByTestId } = render(<MyItems />);

    expect(getByTestId("loading-indicator")).toBeTruthy();
  });
});
