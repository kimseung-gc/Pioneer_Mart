import React from "react";
import { render } from "@testing-library/react-native";
import SingleItem from "@/components/SingleItem";
import { ItemType } from "@/types/types";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@react-navigation/native", () => ({
  useRoute: () => ({
    name: "Home",
  }),
}));

jest.mock("@/stores/useSearchStore", () => {
  const mockItems = [
    {
      id: 1,
      title: "Test Item",
      description: "A test item",
      price: 100,
      image: "https://example.com/image.jpg",
      is_sold: false,
      created_at: "2025-04-01T00:00:00Z",
      category: 1,
      category_name: "Electronics",
      seller: 2,
      is_favorited: false,
      purchase_request_count: 0,
    },
  ];

  const store = {
    toggleFavorite: jest.fn(),
    activeScreen: "home",
    screens: {
      home: { items: mockItems },
      favorites: { items: [] },
      myItems: { items: [] },
    },
  };

  return {
    useItemsStore: (selector = (s: any) => s) => selector(store),
  };
});

jest.mock("@/stores/singleItemStore", () => ({
  __esModule: true,
  default: () => ({
    showFavoritesIcon: true,
    setShowFavoritesIcon: jest.fn(),
  }),
}));

jest.mock("@/stores/userStore", () => ({
  useUserStore: () => ({
    userData: { id: 1 },
  }),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({
    authToken: "fake-token",
  }),
}));

jest.mock("@/components/ZoomModal", () => "ZoomModal");

const mockItem: ItemType = {
  id: 1,
  title: "Test Item",
  description: "A test item",
  price: 100,
  image: "https://example.com/image.jpg",
  is_sold: false,
  created_at: "2025-04-01T00:00:00Z",
  category: 1,
  category_name: "Electronics",
  seller: 2,
  is_favorited: false,
  is_reported: false,
  purchase_request_count: 0,
};

describe("SingleItem component", () => {
  it("renders the item title and price", () => {
    const { getByText } = render(<SingleItem item={mockItem} />);
    expect(getByText("$100")).toBeTruthy();
    expect(getByText("Test Item")).toBeTruthy();
  });
});
