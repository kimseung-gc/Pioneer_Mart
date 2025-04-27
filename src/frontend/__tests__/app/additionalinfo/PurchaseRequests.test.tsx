import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PurchaseRequests from "@/app/additionalinfo/PurchaseRequests"; 
import { useAuth } from "@/app/contexts/AuthContext";
import axios from "axios";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("axios");

jest.mock("@/components/SingleItem", () => {
  const { View, Text } = require("react-native");
  return () => (
    <View>
      <Text>SingleItem Mock</Text>
    </View>
  );
});

describe("PurchaseRequests", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "fake-token",
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: [] }); // Default: empty requests
  });

  it("shows loading indicator initially", async () => {
    const { getByTestId } = render(<PurchaseRequests />);

    // Should find loading spinner
    expect(getByTestId("activity-indicator")).toBeTruthy();
  });

  it("shows empty text when no requests", async () => {
    const { findByText } = render(<PurchaseRequests />);

    // Should find "No sent requests" after loading
    const emptyText = await findByText(/No sent requests/i);
    expect(emptyText).toBeTruthy();
  });

  it("renders Sent tab by default", async () => {
    const { findByText } = render(<PurchaseRequests />);

    // Should find Sent tab active initially
    const sentTabText = await findByText(/Sent Requests/i);
    expect(sentTabText).toBeTruthy();
  });

  it("switches to Received tab", async () => {
    const { findByText, getByText } = render(<PurchaseRequests />);

    const receivedTabButton = getByText(/Received Requests/i);
    fireEvent.press(receivedTabButton);

    // After pressing, should see "No received requests"
    const emptyReceivedText = await findByText(/No received requests/i);
    expect(emptyReceivedText).toBeTruthy();
  });
});
