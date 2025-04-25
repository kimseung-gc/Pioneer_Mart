import { useAuth } from "@/app/contexts/AuthContext";
import StartChatButton from "@/components/StartChatButton";
import { BASE_URL } from "@/config";
import { useUserStore } from "@/stores/userStore";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import { router } from "expo-router";
import React from "react";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/stores/userStore", () => ({
  useUserStore: jest.fn(),
}));

describe("StartChatButton Component", () => {
  jest.clearAllMocks();
  const mockAuthToken = "test-token";
  const mockOtherUserId = "user-123";
  const mockRoomId = "room-456";
  (useAuth as jest.Mock).mockReturnValue({
    authToken: mockAuthToken,
  });
  (useUserStore as unknown as jest.Mock).mockReturnValue({
    userData: { id: "current-user-id" },
  });

  (axios.get as jest.Mock).mockResolvedValue({
    data: { room_id: mockRoomId },
  });
  it("renders the button with correct initial text", () => {
    const { getByText } = render(
      <StartChatButton otherUserId={mockOtherUserId} />
    );
    expect(getByText("Start Chat")).toBeTruthy();
  });
  it("shows loading state when clicked", async () => {
    const { getByText } = render(
      <StartChatButton otherUserId={mockOtherUserId} />
    );

    fireEvent.press(getByText("Start Chat"));

    expect(getByText("Starting Chat...")).toBeTruthy();
  });
  it("calls the API with correct parameters when clicked", async () => {
    const { getByText } = render(
      <StartChatButton otherUserId={mockOtherUserId} />
    );
    await act(async () => {
      fireEvent.press(getByText("Start Chat"));
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `${BASE_URL}/api/chat/get_or_create_room/`,
        {
          params: {
            user_id: mockOtherUserId,
          },
          headers: {
            Authorization: `Bearer ${mockAuthToken}`,
          },
        }
      );
    });
  });
  it("navigates to chat room after successful API call", async () => {
    const { getByText } = render(
      <StartChatButton otherUserId={mockOtherUserId} />
    );

    fireEvent.press(getByText("Start Chat"));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(`/chat/${mockRoomId}`);
    });
  });
  it("handles API errors gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (axios.get as jest.Mock).mockRejectedValue(new Error("API Error"));

    const { getByText } = render(
      <StartChatButton otherUserId={mockOtherUserId} />
    );

    fireEvent.press(getByText("Start Chat"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error starting chat:",
        expect.any(Error)
      );
      expect(getByText("Start Chat")).toBeTruthy(); // button returns to initial state
    });

    consoleErrorSpy.mockRestore();
  });
  it("trims the auth token before sending the request", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "  test-token  ",
    });

    const { getByText } = render(
      <StartChatButton otherUserId={mockOtherUserId} />
    );

    fireEvent.press(getByText("Start Chat"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );
    });
  });
  it("disables the button while loading", async () => {
    const { getByTestId } = render(
      <StartChatButton otherUserId={mockOtherUserId} />
    );

    const button = getByTestId("start-chat-button");
    fireEvent.press(button);
    await waitFor(() => {
      // use accessibility state cause react isn't picking up the disabled button. button being disabled means accessibilityState is also disabled
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });
  });
  it("changes button color when disabled", async () => {
    const { getByTestId } = render(
      <StartChatButton otherUserId={mockOtherUserId} />
    );

    const button = getByTestId("start-chat-button");
    //function to find the background color cause we don't have a state update
    const getBackgroundColor = (style: any) =>
      Array.isArray(style)
        ? style.find((s) => s?.backgroundColor)?.backgroundColor
        : style?.backgroundColor;

    // initial state
    expect(getBackgroundColor(button.props.style)).toBe("blue");

    fireEvent.press(button);

    await waitFor(() => {
      expect(getBackgroundColor(button.props.style)).toBe("gray");
    });
  });
});
