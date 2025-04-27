import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PurchaseRequests from "@/app/additionalinfo/PurchaseRequests"; 
import { useAuth } from "@/app/contexts/AuthContext";
import axios from "axios";

// Mock auth context
jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock axios for API calls
jest.mock("axios");

// Mock SingleItem component used inside PurchaseRequests
jest.mock("@/components/SingleItem", () => {
  const { View, Text } = require("react-native");
  return () => (
    <View>
      <Text>SingleItem Mock</Text>
    </View>
  );
});

// Test suite for PurchaseRequests screen
describe("PurchaseRequests", () => {
  // Setup mock return values before each test
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "fake-token",
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: [] }); // Default: empty requests
  });

  it("shows loading indicator initially", async () => {
    // Render PurchaseRequests
    const { getByTestId } = render(<PurchaseRequests />);

    // Should find loading spinner during initial load
    expect(getByTestId("activity-indicator")).toBeTruthy();
  });

  it("shows empty text when no requests", async () => {
    // Render PurchaseRequests
    const { findByText } = render(<PurchaseRequests />);

    // Should find empty state text after data loads
    const emptyText = await findByText(/No sent requests/i);
    expect(emptyText).toBeTruthy();
  });

  it("renders Sent tab by default", async () => {
    // Render PurchaseRequests
    const { findByText } = render(<PurchaseRequests />);

    // Should find Sent tab active initially
    const sentTabText = await findByText(/Sent Requests/i);
    expect(sentTabText).toBeTruthy();
  });

  it("switches to Received tab", async () => {
    // Render PurchaseRequests
    const { findByText, getByText } = render(<PurchaseRequests />);

    const receivedTabButton = getByText(/Received Requests/i);
    fireEvent.press(receivedTabButton);

    // After switching, should see empty text for received requests
    const emptyReceivedText = await findByText(/No received requests/i);
    expect(emptyReceivedText).toBeTruthy();
  });
});