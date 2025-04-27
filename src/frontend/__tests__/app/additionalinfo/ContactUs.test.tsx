
import React from "react";
import { render } from "@testing-library/react-native";
import ContactUs from "@/app/additionalinfo/ContactUs"; 

describe("ContactUs", () => {
  it("renders the Contact Us screen correctly", () => {
    const { getByText } = render(<ContactUs />);

    expect(
      getByText(
        "If you have any questions or feedback about PioneerMart, please contact us at email@gmail.com."
      )
    ).toBeTruthy();

    expect(
      getByText("We'd love to hear from you about how we can improve the app!")
    ).toBeTruthy();
  });
});
