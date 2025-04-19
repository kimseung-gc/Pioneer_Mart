import WelcomeScreen from "@/app/(auth)";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import { router } from "expo-router";
import React from "react";

// all the mock stuff for font etc.
// jest.mock("expo-font");
jest.mock("axios");
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  Stack: {
    Screen: () => null,
  },
}));

jest.mock("@/components/InputField", () => {
  const { TextInput } = require("react-native");
  // don't wanna add InputField data type ughhhhh :((((
  return (props: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
  }) => (
    <TextInput
      testID="email-input"
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
    />
  );
});

global.alert = jest.fn(() => {}); //can't use spyOn

describe("WelcomeScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); //just be sure
  });

  it("renders correctly with all UI elements", async () => {
    const component = render(<WelcomeScreen />);

    //will do this later
    await act(async () => {
      // Ensure all effects complete
    });

    // these are all the texts thingys on the screen
    expect(component.getByText("Create an Account")).toBeTruthy();
    expect(
      component.getByText("We'll send a code to your Grinnell email account!")
    ).toBeTruthy();
    expect(component.getByTestId("email-input")).toBeTruthy();
    expect(component.getByText("@grinnell.edu")).toBeTruthy();
    expect(component.getByText("Send Code")).toBeTruthy();
  });

  it("updates email state when input changes", async () => {
    const component = render(<WelcomeScreen />); //render welcome screen
    const emailInput = component.getByTestId("email-input"); //get user's email

    // dude i hate react it keeps warning me about act
    await act(async () => {
      fireEvent.changeText(emailInput, "khalidmu");
    });

    const sendCodeButton = component.getByText("Send Code");

    (axios.post as jest.Mock).mockResolvedValueOnce({});

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });

    // Just checking that axios was called with the correct email
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/otpauth/request-otp/"),
      {
        email: "khalidmu@grinnell.edu",
      },
      expect.any(Object)
    );
  });

  it("handles successful OTP request and navigates to OTP screen", async () => {
    const component = render(<WelcomeScreen />);
    const emailInput = component.getByTestId("email-input");
    const sendCodeButton = component.getByText("Send Code");

    await act(async () => {
      fireEvent.changeText(emailInput, "khalidmu"); //username for my email
    });

    (axios.post as jest.Mock).mockResolvedValueOnce({});

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({
        pathname: "/OtpScreen",
        params: { email: "khalidmu@grinnell.edu" },
      });
    });
  });

  it("handles error during OTP request", async () => {
    const component = render(<WelcomeScreen />);
    const emailInput = component.getByTestId("email-input");
    const sendCodeButton = component.getByText("Send Code");

    await act(async () => {
      fireEvent.changeText(emailInput, "khalidmu");
    });

    // This si for all the godforsaken networks errors we've been getting when testing the whole thing
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith("Failed to do OTP stuff");
      // Make sure we didn't navigate
      expect(router.push).not.toHaveBeenCalled();
    });
  });
});
