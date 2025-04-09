import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ProductList from "../../components/ProductList"; 
import { useRoute } from "@react-navigation/native";
import { useItemsStore } from "@/stores/useSearchStore";
import { useAuth } from "@/app/contexts/AuthContext";
import type { ItemType } from "@/types/types";

// Mocks
jest.mock("@react-navigation/native", () => ({
  useRoute: jest.fn(),
}));

jest.mock("@/stores/useSearchStore", () => ({
  useItemsStore: jest.fn(),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// May cause interaction bugs so double check later
jest.mock("../../components/SingleItem", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ item }: { item: any }) => (
    <Text testID="mock-single-item">{item.name}</Text>
  );
});

//Mock items that will be rendered in the list
describe("ProductList", () => {
    const mockItems: ItemType[] = [
        {
            id: 1,
            title: "Test Item 1",
            description: "A nice item",
            price: 20,
            image: "https://example.com/image1.jpg",
            category: 2,
            seller: 1001,
            created_at: "2025-04-08T00:00:00Z",
            is_favorited: false,
            is_sold: false,
            category_name: "Book",
            purchase_request_count: 0
        },
        {
            id: 2,
            title: "Test Item 2",
            description: "Another nice item",
            price: 35,
            image: "https://example.com/image2.jpg",
            category: 3,
            seller: 1002,
            created_at: "2025-04-08T00:00:00Z",
            is_favorited: true,
            is_sold: false,
            category_name: "Clothing",
            purchase_request_count: 0
        },
      ];
      

  const mockScreens = {
    home: {
      hasMore: true,
      isLoadingMore: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoute as jest.Mock).mockReturnValue({ name: "index" });
    (useAuth as jest.Mock).mockReturnValue({ authToken: "fake-token" });
    (useItemsStore as unknown as jest.Mock).mockReturnValue({
      refreshItems: jest.fn(),
      loadMoreItems: jest.fn(),
      screens: mockScreens,
    });
  });

  it("shows loading spinner when isLoading is true", () => {
    const { getByText } = render(
      <ProductList items={null} isLoading={true} source="home" />
    );
    expect(getByText("Loading items...")).toBeTruthy();
  });

  it("shows empty state when items is an empty array", () => {
    const { getByText } = render(
      <ProductList items={[]} isLoading={false} source="home" />
    );
    expect(getByText("No items found in this category")).toBeTruthy();
  });

  it("renders correct number of SingleItem components", () => {
    const { getAllByTestId } = render(
      <ProductList items={mockItems} isLoading={false} source="home" />
    );
    const renderedItems = getAllByTestId("mock-single-item");
    expect(renderedItems.length).toBe(2);
  });

  it("displays correct title based on route", () => {
    const { getByText } = render(
      <ProductList items={mockItems} source="home" />
    );
    expect(getByText("Latest Items")).toBeTruthy();
  });

  // This might cause bugs so be careful
  it("calls refreshItems when pull-to-refresh is triggered", () => {
    const mockRefresh = jest.fn();
  
    (useItemsStore as unknown as jest.Mock).mockReturnValue({
      refreshItems: mockRefresh,
      loadMoreItems: jest.fn(),
      screens: {
        home: {
          hasMore: true,
          isLoadingMore: false,
        },
      },
    });
  
    const { UNSAFE_getByType } = render(
      <ProductList items={mockItems} isLoading={false} source="home" />
    );
  
    const flatList = UNSAFE_getByType(require("react-native").FlatList);
    const refreshControl = flatList.props.refreshControl;
  
    // Call the onRefresh manually
    refreshControl.props.onRefresh();
  
    expect(mockRefresh).toHaveBeenCalledWith("home", "fake-token");
  });

  it("calls loadMoreItems when end reached", () => {
    const mockLoadMore = jest.fn();
    (useItemsStore as unknown as jest.Mock).mockReturnValue({
      refreshItems: jest.fn(),
      loadMoreItems: mockLoadMore,
      screens: mockScreens,
    });

    const { UNSAFE_getByType } = render(
      <ProductList items={mockItems} source="home" />
    );

    const flatList = UNSAFE_getByType(require("react-native").FlatList);
    fireEvent(flatList, "endReached");

    expect(mockLoadMore).toHaveBeenCalledWith("home", "fake-token");
  });

  it("does not call loadMoreItems if already loading more", () => {
    (useItemsStore as unknown as jest.Mock).mockReturnValue({
      refreshItems: jest.fn(),
      loadMoreItems: jest.fn(),
      screens: {
        home: {
          hasMore: true,
          isLoadingMore: true, // already loading
        },
      },
    });

    const { UNSAFE_getByType } = render(
      <ProductList items={mockItems} source="home" />
    );

    const flatList = UNSAFE_getByType(require("react-native").FlatList);
    fireEvent(flatList, "endReached");

    expect(useItemsStore().loadMoreItems).not.toHaveBeenCalled();
  });
});
