import ProfileScreen from "@/app/(tabs)/settings";
import { useAuth } from "@/app/contexts/AuthContext";
import DangerModal from "@/components/DangerModal";
import { useUserStore } from "@/stores/userStore";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseUserStore = jest.fn();
jest.spyOn(Alert, "alert");

jest.mock("@/stores/userStore", () => ({
  __esModule: true,
  useUserStore: () => mockUseUserStore(), // this is key
}));
jest.mock("@/components/DangerModal", () => jest.fn().mockReturnValue(null));

describe("ProfileScreen", () => {
  const mockFetchUserData = jest.fn();
  const mockOnLogout = jest.fn();
  const mockRouter = { push: jest.fn() };

  // clear all previous mocks just to be safe
  beforeEach(() => {
    jest.clearAllMocks();
    // mock useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "test-token",
      onLogout: mockOnLogout,
    });

    //mock useUserStore hook
    mockUseUserStore.mockReturnValue({
      //cast as unknown to bypass typescript stuff
      userData: { email: "test@grinnell.edu" },
      isLoading: false,
      error: null,
      fetchUserData: mockFetchUserData,
      updateUserData: jest.fn(),
      clearUserData: jest.fn(),
    });
  });

  it("renders loading state correctly", () => {
    mockUseUserStore.mockReturnValueOnce({
      userData: null,
      isLoading: true,
      error: null,
      fetchUserData: jest.fn(),
      updateUserData: jest.fn(),
      clearUserData: jest.fn(),
    });

    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Loading profile...")).toBeTruthy();
  });

  it("fetches user data on mount when authToken is present", async () => {
    render(<ProfileScreen />);
    await waitFor(() => {
      expect(mockFetchUserData).toHaveBeenCalledWith("test-token");
    });
  });

  it("renders user email from userData", () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("test@grinnell.edu")).toBeTruthy();
  });

  it("navigates to purchase requests screen when presses", () => {
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText("Purchase Requests"));
    expect(router.push).toHaveBeenCalledWith(
      "../additionalinfo/PurchaseRequests"
    );
  });
  it("navigatees to My items screen when pressed", () => {
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText("My Items"));
    expect(router.push).toHaveBeenCalledWith("../additionalinfo/MyItems");
  });
  it("navigatees to Reporteditems screen when pressed", () => {
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText("Reported Items"));
    expect(router.push).toHaveBeenCalledWith("../additionalinfo/ReportedItems");
  });
  it("navigatees to FAQs screen when pressed", () => {
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText("FAQs"));
    expect(router.push).toHaveBeenCalledWith("../additionalinfo/FAQs");
  });
  it("navigatees to Contact US screen when presse", () => {
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText("Contact Us"));
    expect(router.push).toHaveBeenCalledWith("../additionalinfo/ContactUs");
  });
  it("shows clear history modal when Clear history is pressed", () => {
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText("Clear History"));
    expect(DangerModal).toHaveBeenCalledWith(
      expect.objectContaining({
        isVisible: true,
        dangerMessage: "Are you sure you want to clear your history?",
      }),
      expect.anything()
    );
  });
  it("calls onLogout when logout modal confirms", async () => {
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText("Log Out"));
    // get the last call to danger modal
    const mockDangerModal = DangerModal as jest.Mock;
    const lastCallArgs =
      mockDangerModal.mock.calls[mockDangerModal.mock.calls.length - 1][0];
    // wait for onDone function that would be triggered on modal confirm
    await lastCallArgs.onDone();
    expect(mockOnLogout).toHaveBeenCalled();
  });
  it("handles error when fetching user data fails", async () => {
    mockFetchUserData.mockRejectedValue(new Error("Failed to fetch"));
    render(<ProfileScreen />);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to load profile. Please try again"
      );
    });
  });
  it("does not fetch user data when authToken is not present", () => {
    // authtoken is null so profile and userData shouldn't be rendered at all
    (useAuth as jest.Mock).mockReturnValueOnce({
      authToken: null,
      onLogout: mockOnLogout,
    });
    render(<ProfileScreen />);
    expect(mockFetchUserData).not.toHaveBeenCalled();
  });
  it("properly closes modals on cancel", async () => {
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText("Clear History"));
    // get the last call to danger modal to clear history
    const clearHistoryArgs = (DangerModal as jest.Mock).mock.calls[0][0];
    await act(async () => {
      clearHistoryArgs.onClose();
    });
    (DangerModal as jest.Mock).mockClear();
    //render again to see the updated state
    const { getByText: getByTextAfterClose } = render(<ProfileScreen />);
    expect(DangerModal).toHaveBeenCalledWith(
      expect.objectContaining({
        isVisible: false,
      }),
      expect.anything()
    );
  });
});
