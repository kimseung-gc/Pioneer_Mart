import WelcomeScreen from "@/app/(auth)";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { useAuth } from "@/app/contexts/AuthContext";
import api from "@/types/api";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

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
  const mockUseAuth = useAuth as jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks(); //just be sure
  });

  it("renders with terms modal initially visible", async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      setAuthToken: jest.fn(),
      isAuthenticated: false,
      loading: false,
      onLogout: jest.fn(),
    });
    const { getByTestId, queryByTestId, queryByText } = render(
      <WelcomeScreen />
    );

    // modal should be visible initially
    expect(getByTestId("terms-modal")).toBeTruthy();

    // terms acceptance ui elements should not be visible yet
    expect(queryByTestId("email-input")).toBeNull();
    expect(queryByText("Send Verification Code")).toBeNull();
  });

  it("shows registration form when terms are accepted", async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      setAuthToken: jest.fn(),
      isAuthenticated: false,
      loading: false,
      onLogout: jest.fn(),
    });
    const { getByTestId, getByText, queryByText } = render(<WelcomeScreen />);

    // accept the terms
    fireEvent.press(getByTestId("accept-button"));

    // should now show registration form
    expect(getByTestId("email-input")).toBeTruthy();
    expect(getByTestId("send-code-button")).toBeTruthy();

    // should not show the terms acceptance prompt
    expect(
      queryByText("Please accept the terms and conditions to continue")
    ).toBeNull();
  });

  it("reopens terms modal when 'View Terms and Conditions' link is clicked", async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      setAuthToken: jest.fn(),
      isAuthenticated: false,
      loading: false,
      onLogout: jest.fn(),
    });
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

  it("updates email state when input changes", async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      setAuthToken: jest.fn(),
      isAuthenticated: false,
      loading: false,
      onLogout: jest.fn(),
    });
    const component = render(<WelcomeScreen />); //render welcome screen

    const acceptButton = await component.findByTestId("accept-button");
    fireEvent.press(acceptButton);

    const emailInput = component.getByTestId("email-input"); //get user's email

    // dude i hate react it keeps warning me about act
    await act(async () => {
      fireEvent.changeText(emailInput, "khalidmu");
    });

    const sendCodeButton = component.getByTestId("send-code-button");

    (api.post as jest.Mock).mockResolvedValueOnce({});

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });

    // Just checking that api was called with the correct email
    expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining("/otpauth/request-otp/"),
      {
        email: "khalidmu@grinnell.edu",
      },
      expect.any(Object)
    );
  });

  it("handles successful OTP request and navigates to OTP screen", async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      setAuthToken: jest.fn(),
      isAuthenticated: false,
      loading: false,
      onLogout: jest.fn(),
    });
    const component = render(<WelcomeScreen />);

    const acceptButton = await component.findByTestId("accept-button");
    fireEvent.press(acceptButton);

    const emailInput = component.getByTestId("email-input");
    const sendCodeButton = component.getByTestId("send-code-button");

    await act(async () => {
      fireEvent.changeText(emailInput, "khalidmu"); //username for my email
    });

    (api.post as jest.Mock).mockResolvedValueOnce({});

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({
        pathname: "/(auth)/OtpScreen",
        params: { email: "khalidmu@grinnell.edu" },
      });
    });
  });

  it("handles error during OTP request", async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      setAuthToken: jest.fn(),
      isAuthenticated: false,
      loading: false,
      onLogout: jest.fn(),
    });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const component = render(<WelcomeScreen />);

    const acceptButton = await component.findByTestId("accept-button");
    fireEvent.press(acceptButton);

    const emailInput = component.getByTestId("email-input");
    const sendCodeButton = component.getByTestId("send-code-button");

    await act(async () => {
      fireEvent.changeText(emailInput, "khalidmu");
    });

    // This si for all the godforsaken networks errors we've been getting when testing the whole thing
    (api.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(
        "Authentication Error\n\nFailed to send verification code. Please try again later."
      );
      // Make sure we didn't navigate
      expect(router.push).not.toHaveBeenCalled();
    });
    consoleSpy.mockRestore(); // Clean up
  });

  it("doesn't allow otp request if email is empty", async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      setAuthToken: jest.fn(),
      isAuthenticated: false,
      loading: false,
      onLogout: jest.fn(),
    });
    const { getByTestId } = render(<WelcomeScreen />);

    // accept terms
    fireEvent.press(getByTestId("accept-button"));

    const sendCodeButton = getByTestId("send-code-button");

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });
    expect(window.alert).toHaveBeenCalledWith(
      "Error\n\nPlease enter your username first"
    );
  });
  it("properly formats the email with @grinnell.edu domain", async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      setAuthToken: jest.fn(),
      isAuthenticated: false,
      loading: false,
      onLogout: jest.fn(),
    });
    const { getByTestId } = render(<WelcomeScreen />);

    // accept terms
    fireEvent.press(getByTestId("accept-button"));

    const emailInput = getByTestId("email-input");

    await act(async () => {
      fireEvent.changeText(emailInput, "testuser");
    });

    const sendCodeButton = getByTestId("send-code-button");

    (api.post as jest.Mock).mockResolvedValueOnce({});

    await act(async () => {
      fireEvent.press(sendCodeButton);
    });

    expect(api.post).toHaveBeenCalledWith(
      expect.any(String),
      {
        email: "testuser@grinnell.edu",
      },
      expect.any(Object)
    );
  });

  it("closes modal without accepting terms when close button is pressed", async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      setAuthToken: jest.fn(),
      isAuthenticated: false,
      loading: false,
      onLogout: jest.fn(),
    });
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
  it("redirects to /tabs if user is authenticated", async () => {
    mockUseAuth.mockReturnValue({
      authToken: "test-token",
      setAuthToken: jest.fn(),
      isAuthenticated: true,
      loading: false,
      onLogout: jest.fn(),
    });

    render(<WelcomeScreen />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });
});
