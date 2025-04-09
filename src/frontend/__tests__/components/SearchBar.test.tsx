import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SearchBar from "../../components/SearchBar"; 
import { useItemsStore } from "@/stores/useSearchStore";
import { useAuth } from "@/app/contexts/AuthContext";

// Mock EvilIcons
jest.mock("@expo/vector-icons/EvilIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ name }: { name: string }) => <Text>Icon - {name}</Text>;
});

// Mock Zustand store
jest.mock("@/stores/useSearchStore", () => ({
  useItemsStore: jest.fn(),
}));

// Mock AuthContext
jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("SearchBar", () => {
  const mockPerformSearch = jest.fn();
  const mockClearSearch = jest.fn();

  // Set up mock state before each test
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue("mock-auth-token");

    (useItemsStore as unknown as jest.Mock).mockReturnValue({
      performSearch: mockPerformSearch,
      clearSearch: mockClearSearch,
      screens: {
        home: {
          searchQuery: "",
        },
        favorites: {
          searchQuery: "shoes",
        },
        myItems: {
          searchQuery: "",
        },
      },
    });
  });

  // Should start with an empty input for home screen
  it("renders correctly with initial empty searchQuery", () => {
    const { getByPlaceholderText } = render(<SearchBar screenId="home" />);
    const input = getByPlaceholderText("Search items...");
    expect(input.props.value).toBe("");
  });

  it("syncs local state with global searchQuery from store", async () => {
    const { getByDisplayValue } = render(<SearchBar screenId="favorites" />);
    await waitFor(() => {
      expect(getByDisplayValue("shoes")).toBeTruthy();
    });
  });

  // Should also trigger search when tapping the search icon
  it("calls performSearch on submit", () => {
    const { getByPlaceholderText } = render(<SearchBar screenId="home" />);
    const input = getByPlaceholderText("Search items...");

    fireEvent.changeText(input, "jacket");
    fireEvent(input, "submitEditing");

    expect(mockPerformSearch).toHaveBeenCalledWith("home", "jacket", "mock-auth-token");
  });

  it("calls performSearch on icon press", () => {
    const { getByText, getByPlaceholderText } = render(
      <SearchBar screenId="home" />
    );
    const input = getByPlaceholderText("Search items...");
    const icon = getByText("Icon - search");

    fireEvent.changeText(input, "boots");
    fireEvent.press(icon);

    expect(mockPerformSearch).toHaveBeenCalledWith("home", "boots", "mock-auth-token");
  });
});
