import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ZoomModal from "@/components/ZoomModal";
import { ItemType } from "@/types/types";

// Mock vector icons to avoid font loading issues
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    AntDesign: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

// Mock ZoomableView cuz it's native and may not play well with Jest
jest.mock("@openspacelabs/react-native-zoomable-view", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    ReactNativeZoomableView: ({ children }: { children: React.ReactNode }) => (
      <View testID="zoomable-view">{children}</View>
    ),
  };
});

// Sample item
const mockItem: ItemType = {
  id: 1,
  title: "Cool Jacket",
  description: "A really cool jacket",
  price: 40,
  image: "https://example.com/image.jpg",
  category: 1,
  category_name: "Clothing",
  seller: 100,
  is_favorited: false,
  is_sold: false,
  created_at: "2025-04-01T00:00:00Z",
  purchase_request_count: 2,
};

describe("ZoomModal", () => {
  it("renders modal with close icon and zoom view", () => {
    const onCloseMock = jest.fn();

    const { getByText, getByTestId, UNSAFE_queryAllByType } = render(
      <ZoomModal isVisible={true} onClose={onCloseMock} item={mockItem} />
    );

    // Check if the close icon is rendered
    expect(getByText("close")).toBeTruthy();

    // Check if the zoomable image container is present
    expect(getByTestId("zoomable-view")).toBeTruthy();

    const images = UNSAFE_queryAllByType(require("react-native").Image);
    expect(images.length).toBeGreaterThan(0);
    expect(images[0].props.source).toEqual({ uri: mockItem.image });
  });

  it("calls onClose when close button is pressed", () => {
    const onCloseMock = jest.fn();

    const { getByText } = render(
      <ZoomModal isVisible={true} onClose={onCloseMock} item={mockItem} />
    );

    fireEvent.press(getByText("close"));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("does not render when isVisible is false", () => {
    const { queryByText } = render(
      <ZoomModal isVisible={false} onClose={() => {}} item={mockItem} />
    );

    expect(queryByText("close")).toBeNull();
  });
});