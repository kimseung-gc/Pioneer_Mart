import React from "react";
import { render } from "@testing-library/react-native";
import ContactUs from "@/app/additionalinfo/ContactUs"; 

// Test suite for ContactUs screen
describe("ContactUs", () => {
  it("renders the Contact Us screen correctly", () => {
    // Render the ContactUs component
    const { getByText } = render(<ContactUs />);

    // Check for the main instruction text
    expect(
      getByText(
        "If you have any questions or feedback about PioneerMart, please contact us at email@gmail.com."
      )
    ).toBeTruthy();

    // Check for the follow-up encouragement text
    expect(
      getByText("We'd love to hear from you about how we can improve the app!")
    ).toBeTruthy();
  });
});
