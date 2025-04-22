import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Header from "../../components/Header";
import * as router from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";

// Mock Entypo icon
jest.mock("@expo/vector-icons/Entypo", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => <View testID="mock-icon" />;
});

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({
    authToken: "mock-token",
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useRoute: jest.fn(),
  useFocusEffect: jest.fn((fn) => fn()), // just calls the effect immediately
}));

// Mock SafeAreaInsets
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(),
}));

jest.mock("@/stores/chatStore", () => ({
  useChatStore: () => ({
    unreadCount: 3,
    fetchUnreadCount: jest.fn().mockResolvedValue(undefined), // mock async function cause otherwise it'll run forever
  }),
}));

// Mock SearchBar
jest.mock("../../components/SearchBar", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ screenId }: { screenId: string }) => (
    <Text>SearchBar - {screenId}</Text>
  );
});

describe("Header Component", () => {
  beforeEach(() => {
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 20 });
    jest.clearAllMocks();
  });

  it("renders SearchBar normally", () => {
    (useRoute as jest.Mock).mockReturnValue({ name: "home" });

    const { getByText } = render(<Header screenId="home" />);
    expect(getByText("SearchBar - home")).toBeTruthy();
  });

  it("renders back button and SearchBar on MyItems screen", () => {
    (useRoute as jest.Mock).mockReturnValue({ name: "additionalinfo/MyItems" });

    const { getByText, getByTestId } = render(<Header screenId="myItems" />);
    expect(getByText("SearchBar - myItems")).toBeTruthy();
    expect(getByTestId("back-button")).toBeTruthy();
  });

  it("calls router.back() when back button is pressed", () => {
    (useRoute as jest.Mock).mockReturnValue({ name: "additionalinfo/MyItems" });

    const { getByTestId } = render(<Header screenId="myItems" />);
    fireEvent.press(getByTestId("back-button"));

    expect(router.router.back).toHaveBeenCalled();
  });
});
