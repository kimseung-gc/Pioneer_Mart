import React from "react";
import { render } from "@testing-library/react-native";
import ContactUs from "@/app/additionalinfo/ContactUs";
import { useAuth } from "@/app/contexts/AuthContext";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Test suite for ContactUs screen
describe("ContactUs", () => {
  const mockAuthToken = "test-token";
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ authToken: mockAuthToken });
  });
  it("renders the Contact Us screen correctly", () => {
    // Render the ContactUs component
    const { getByText } = render(<ContactUs />);

    // Check for the main instruction text
    expect(
      getByText(
        "If you have any questions or feedback about PioneerMart, please fill out the form below."
      )
    ).toBeTruthy();

    // Check for the follow-up encouragement text
    expect(
      getByText("We'd love to hear from you about how we can improve the app!")
    ).toBeTruthy();
  });
});
