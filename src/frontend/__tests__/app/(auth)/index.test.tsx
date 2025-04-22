import WelcomeScreen from "@/app/(auth)";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import { router } from "expo-router";
import React from "react";

// jest.mock("@/components/TCModal", () => {
//   const { Modal, View, Text, TouchableOpacity } = require("react-native");

//   // Define interface for the mock component props
//   interface MockTermsModalProps {
//     isVisible: boolean;
//     termsAccepted: boolean;
//     onAccept: () => void;
//     onClose: () => void;
//   }

//   const MockTermsModal: React.FC<MockTermsModalProps> = ({
//     isVisible,
//     termsAccepted,
//     onAccept,
//     onClose,
//   }) => {
//     if (!isVisible) return null;

//     return (
//       <Modal visible={isVisible} testID="terms-modal">
//         <View>
//           <Text testID="terms-content">Terms and Conditions Content</Text>
//           <TouchableOpacity testID="close-button" onPress={onClose}>
//             <Text>Close</Text>
//           </TouchableOpacity>
//           <TouchableOpacity testID="accept-button" onPress={onAccept}>
//             <Text>Accept</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     );
//   };

//   return MockTermsModal;
// });

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

    const acceptButton = await component.findByTestId("accept-button");
    fireEvent.press(acceptButton);

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
      expect(global.alert).toHaveBeenCalledWith("Failed to do OTP stuff");
      // Make sure we didn't navigate
      expect(router.push).not.toHaveBeenCalled();
    });
    consoleSpy.mockRestore(); // Clean up
  });
});
