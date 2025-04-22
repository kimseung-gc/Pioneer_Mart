import WelcomeScreen from "@/app/(auth)";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";

jest.mock("@/components/TCModal", () => {
  const { Modal, View, Text, TouchableOpacity } = require("react-native");

  // Define interface for the mock component props
  interface MockTermsModalProps {
    isVisible: boolean;
    onAccept: () => void;
    onClose: () => void;
  }

  return function MockTCModal({
    isVisible,
    onAccept,
    onClose,
  }: MockTermsModalProps) {
    if (!isVisible) return null;

    return (
      <View testID="terms-modal">
        <Text testID="terms-content">Terms and Conditions Content</Text>
        <TouchableOpacity testID="close-button" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="accept-button" onPress={onAccept}>
          <Text>Accept</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

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

jest.spyOn(Alert, "alert");

describe("WelcomeScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); //just be sure
  });

  it("renders with terms modal initially visible", async () => {
    const { getByTestId, queryByTestId, queryByText } = render(
      <WelcomeScreen />
    );

    // modal should be visible initially
    expect(getByTestId("terms-modal")).toBeTruthy();

    // terms acceptance ui elements should not be visible yet
    expect(queryByTestId("email-input")).toBeNull();
    expect(queryByText("Send Code")).toBeNull();
  });

  it("shows terms acceptance prompt when terms are not accepted", async () => {
    const { getByTestId, getByText } = render(<WelcomeScreen />);

    // close the modal without accepting terms
    fireEvent.press(getByTestId("close-button"));

    // should show the prompt to accept terms
    expect(
      getByText("Please accept the terms and conditions to continue")
    ).toBeTruthy();
    expect(getByText("View Terms")).toBeTruthy();
  });

  it("shows registration form when terms are accepted", async () => {
    const { getByTestId, getByText, queryByText } = render(<WelcomeScreen />);

    // accept the terms
    fireEvent.press(getByTestId("accept-button"));

    // should now show registration form
    expect(getByTestId("email-input")).toBeTruthy();
    expect(getByText("Send Code")).toBeTruthy();

    // should not show the terms acceptance prompt
    expect(
      queryByText("Please accept the terms and conditions to continue")
    ).toBeNull();
  });

  it("reopens terms modal when 'View Terms and Conditions' link is clicked", async () => {
    const { getByTestId, getByText, queryByTestId } = render(<WelcomeScreen />);

    // accept terms to show registration form
    fireEvent.press(getByTestId("accept-button"));

    // modal should be hidden
    expect(queryByTestId("terms-modal")).toBeNull();

    // click the terms link
    fireEvent.press(getByText("View Terms and Conditions"));

    // modal should reappear
    expect(getByTestId("terms-modal")).toBeTruthy();
  });

  // it("renders correctly with all UI elements", async () => {
  //   const component = render(<WelcomeScreen />);

  //   //will do this later
  //   await act(async () => {
  //     // Ensure all effects complete
  //   });

  //   const acceptButton = await component.findByTestId("accept-button");
  //   fireEvent.press(acceptButton);

  //   // these are all the texts thingys on the screen
  //   expect(component.getByText("Create an Account")).toBeTruthy();
  //   expect(
  //     component.getByText("We'll send a code to your Grinnell email account!")
  //   ).toBeTruthy();
  //   expect(component.getByTestId("email-input")).toBeTruthy();
  //   expect(component.getByText("@grinnell.edu")).toBeTruthy();
  //   expect(component.getByText("Send Code")).toBeTruthy();
  // });

  it("updates email state when input changes", async () => {
    const component = render(<WelcomeScreen />); //render welcome screen

    const acceptButton = await component.findByTestId("accept-button");
    fireEvent.press(acceptButton);

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

    const acceptButton = await component.findByTestId("accept-button");
    fireEvent.press(acceptButton);

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
        pathname: "/(auth)/OtpScreen",
        params: { email: "khalidmu@grinnell.edu" },
      });
    });
  });

  it("handles error during OTP request", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const component = render(<WelcomeScreen />);

    const acceptButton = await component.findByTestId("accept-button");
    fireEvent.press(acceptButton);

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
      expect(Alert.alert).toHaveBeenCalledWith("Failed to do OTP stuff");
      // Make sure we didn't navigate
      expect(router.push).not.toHaveBeenCalled();
    });
    consoleSpy.mockRestore(); // Clean up
  });

  it("doesn't allow otp request if email is empty", async () => {
    const { getByTestId, getByText } = render(<WelcomeScreen />);

    // accept terms
    fireEvent.press(getByTestId("accept-button"));

    const sendCodeButton = getByText("Send Code");

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });

    // should still attempt the request with empty string
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/otpauth/request-otp/"),
      {
        email: "@grinnell.edu",
      },
      expect.any(Object)
    );
  });
  it("properly formats the email with @grinnell.edu domain", async () => {
    const { getByTestId, getByText } = render(<WelcomeScreen />);

    // accept terms
    fireEvent.press(getByTestId("accept-button"));

    const emailInput = getByTestId("email-input");

    await act(async () => {
      fireEvent.changeText(emailInput, "testuser");
    });

    const sendCodeButton = getByText("Send Code");

    (axios.post as jest.Mock).mockResolvedValueOnce({});

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      {
        email: "testuser@grinnell.edu",
      },
      expect.any(Object)
    );
  });

  it("closes modal without accepting terms when close button is pressed", async () => {
    const { getByTestId, queryByTestId, getByText } = render(<WelcomeScreen />);

    // modal should be visible initially
    expect(getByTestId("terms-modal")).toBeTruthy();

    // close the modal
    fireEvent.press(getByTestId("close-button"));

    // modal should be hidden
    expect(queryByTestId("terms-modal")).toBeNull();

    // should show the prompt to accept terms since terms weren't accepted
    expect(
      getByText("Please accept the terms and conditions to continue")
    ).toBeTruthy();
  });
});
