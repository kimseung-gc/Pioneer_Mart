import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import FAQs from "@/app/additionalinfo/FAQs";

describe("FAQs", () => {
  it("renders all FAQ questions", () => {
    const { getByText } = render(<FAQs />);

    expect(getByText("How do I edit my account?")).toBeTruthy();
    expect(getByText("Do I need to have a username or password to access the app?")).toBeTruthy();
    expect(getByText("How do I contact customer support?")).toBeTruthy();
    expect(getByText("What payment methods do you accept?")).toBeTruthy();
    expect(getByText("Once I send a Purchase Request, how do I get the item?")).toBeTruthy();
    expect(getByText("What happens if the seller doesn't contact me or forgets?")).toBeTruthy();
  });

  it("expands and shows answer when a question is clicked", () => {
    const { getByText, queryByText } = render(<FAQs />);

    // Initially, the answer should not be visible
    expect(
      queryByText(
        "The only part of your account that you can edit is your preferred payment method, pronouns, and preferred name."
      )
    ).toBeNull();

    // Press the question
    fireEvent.press(getByText("How do I edit my account?"));

    // After pressing, the answer should appear
    expect(
      getByText(
        "The only part of your account that you can edit is your preferred payment method, pronouns, and preferred name."
      )
    ).toBeTruthy();
  });
});
