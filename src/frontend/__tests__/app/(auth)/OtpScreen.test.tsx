import OtpScreen from "@/app/(auth)/OtpScreen";
import { useAuth } from "@/app/contexts/AuthContext";
import api from "@/types/api";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
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
    (useAuth as jest.Mock).mockReturnValue({
      setTokens: jest.fn(),
    });
    const { getByText, getByTestId } = render(<OtpScreen />);

    expect(getByTestId("verify-code-button")).toBeTruthy();
    expect(
      getByText("Please enter the 6-digit code we sent to your Grinnell email")
    ).toBeTruthy();
    expect(getByTestId("otp-input")).toBeTruthy();
    expect(getByText("Verify")).toBeTruthy();
  });

  it("handles successful OTP verification", async () => {
    const mockAuthToken = "test-access-token";
    const mockRefreshToken = "test-refresh-token";
    const mockSetTokens = jest.fn();

    (useAuth as jest.Mock).mockReturnValue({
      setTokens: mockSetTokens,
    });

    (api.post as jest.Mock).mockResolvedValueOnce({
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
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining("/otpauth/verify-otp/"),
        {
          email: "test@example.com",
          otp: "123456",
        }
      );
      expect(mockSetTokens).toHaveBeenCalledWith(
        mockAuthToken,
        mockRefreshToken
      );
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          text1: "Logged in successfully",
        })
      );
      expect(router.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("handles failed OTP verification", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    (api.post as jest.Mock).mockRejectedValueOnce(new Error("Invalid OTP"));
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
      expect(api.post).toHaveBeenCalledWith(
        //send to the correct endpoint
        expect.stringContaining("/otpauth/verify-otp/"),
        {
          email: "test@example.com",
          otp: "999999",
        }
      );
    });
    consoleSpy.mockRestore();
  });

  //test for pressing Resend and going back to the request code screen
  it("sends new code when resend is pressed", () => {
    const { getByTestId } = render(<OtpScreen />);
    const resendButton = getByTestId("resend-button");
    act(() => {
      fireEvent.press(resendButton);
    });
    expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining("/otpauth/request-otp/"),
      {
        email: "test@example.com",
      },
      expect.any(Object)
    );
  });
});
