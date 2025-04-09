import OtpScreen from "@/app/OtpScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";

jest.mock("expo-font");
jest.mock("axios");
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest
    .fn()
    .mockReturnValue({ email: "test@example.com" }),
}));

jest.mock("frontend/app/contexts/AuthContext.tsx", () => ({
  useAuth: jest.fn().mockReturnValue({
    setAuthToken: jest.fn(),
  }),
}));

jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock the OtpInput component
jest.mock("react-native-otp-entry", () => ({
  OtpInput: (props: any) => {
    // Using a require statement inside the mock factory is allowed
    const { TextInput } = require("react-native");
    return (
      <TextInput
        testID="otp-input"
        onChangeText={props.onTextChange}
        maxLength={props.numberOfDigits}
      />
    );
  },
}));

describe("OtpScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders correctly with email from params", () => {
    const { getByText, getByTestId } = render(<OtpScreen />);

    expect(getByText("Enter Your Verification Code")).toBeTruthy();
    expect(getByText("We sent it to")).toBeTruthy();
    expect(getByText("your Grinnell email!")).toBeTruthy();
    expect(getByTestId("otp-input")).toBeTruthy();
    expect(getByText("Verify")).toBeTruthy();
  });

  it("updated OTP state when input changes", async () => {
    const { getByTestId } = render(<OtpScreen />);
    const otpInput = getByTestId("otp-input");
    await act(async () => {
      fireEvent.changeText(otpInput, "123456");
    });
    // since this state is internal I'll do the API stuff later
  });

  it("handles successful OTP verification", async () => {
    const mockAuthToken = "test-access-token";
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        access: mockAuthToken,
        refresh: "test-refresh-token",
      },
    });
    const { getByText, getByTestId } = render(<OtpScreen />);
    const otpInput = getByTestId("otp-input");
    const verifyButton = getByText("Verify");

    act(() => {
      fireEvent.changeText(otpInput, "123456");
    });
    act(() => {
      fireEvent.press(verifyButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/otpauth/verify-otp/"),
        {
          email: "test@example.com",
          otp: "123456",
        }
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "authToken",
        mockAuthToken
      );
      expect(Alert.alert).toHaveBeenCalledWith("Success", "Login successful!");
      expect(router.push).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("handles failed OTP verification", async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error("Invalid OTP"));
    const { getByText, getByTestId } = render(<OtpScreen />);
    const otpInput = getByTestId("otp-input");
    const verifyButton = getByText("Verify");
    act(() => {
      fireEvent.changeText(otpInput, "999999");
    });
    act(() => {
      fireEvent.press(verifyButton);
    });
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        //send to the correct endpoint
        expect.stringContaining("/api/otpauth/verify-otp/"),
        {
          email: "test@example.com",
          otp: "999999",
        }
      );
      //assert that this was NOT called with a success message for testing purposes since it doesn't use the backend yet
      expect(Alert.alert).not.toHaveBeenCalledWith(
        "Success",
        expect.anything()
      );
    });
  });

  //test for pressing Resend and going back to the request code screen
  it("navigates back when resend is pressed", () => {
    const { getByText } = render(<OtpScreen />);
    const resendButton = getByText("Resend");
    act(() => {
      fireEvent.press(resendButton);
    });
    expect(router.back).toHaveBeenCalled();
  });
});
