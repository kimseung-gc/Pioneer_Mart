import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import FAQs from "@/app/additionalinfo/FAQs";

// Test suite for FAQs screen
describe("FAQs", () => {
  it("renders all FAQ questions", () => {
    // Render the FAQs component
    const { getByText } = render(<FAQs />);

    // Verify all FAQ questions are displayed
    expect(getByText("How do I edit my account?")).toBeTruthy();
    expect(getByText("Do I need to have a username or password to access the app?")).toBeTruthy();
    expect(getByText("How do I contact customer support?")).toBeTruthy();
    expect(getByText("What payment methods do you accept?")).toBeTruthy();
    expect(getByText("Once I send a Purchase Request, how do I get the item?")).toBeTruthy();
    expect(getByText("What happens if the seller doesn't contact me or forgets?")).toBeTruthy();
  });

  it("expands and shows answer when a question is clicked", () => {
    // Render the FAQs component
    const { getByText, queryByText } = render(<FAQs />);

    // Initially, the answer should not be visible
    expect(
      queryByText(
        "The only part of your account that you can edit is your preferred payment method, pronouns, and preferred name."
      )
    ).toBeNull();

    // Simulate clicking on a question
    fireEvent.press(getByText("How do I edit my account?"));

    // After clicking, the answer should be displayed
    expect(
      getByText(
        "The only part of your account that you can edit is your preferred payment method, pronouns, and preferred name."
      )
    ).toBeTruthy();
  });
});