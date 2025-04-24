import { useAuth } from "@/app/contexts/AuthContext";
import ReportModal from "@/components/ReportModal";
import { useItemsStore } from "@/stores/useSearchStore";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

jest.mock("@/app/contexts/AuthContext");
jest.mock("@/stores/useSearchStore");

describe("ReportModal", () => {
  const mockOnClose = jest.fn();
  const mockToggleReport = jest.fn();
  const mockAuthToken = "test-auth-token";
  const mockItemId = 123;
  beforeEach(() => {
    // reset mocks before each test
    jest.clearAllMocks();

    // setup default mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      authToken: mockAuthToken,
    });
    (useItemsStore as unknown as jest.Mock).mockReturnValue({
      toggleReport: mockToggleReport,
    });
  });
  it("renders correctly when visible", () => {
    const { getByText } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );

    expect(getByText("Report Item")).toBeTruthy();
    expect(getByText("Select a reason for reporting:")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Submit")).toBeTruthy();
  });
  it("does not render when not visible", () => {
    const { queryByText } = render(
      <ReportModal
        isVisible={false}
        onClose={mockOnClose}
        itemId={mockItemId}
      />
    );

    expect(queryByText("Report Item")).toBeNull();
  });
  it("displays all report reasons", () => {
    const { getByText } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );

    const expectedReasons = [
      "Prohibited item",
      "Counterfeit or replica",
      "Offensive content",
      "Misleading description",
      "Scam or fraud",
      "Inappropriate price",
      "Other",
    ];

    expectedReasons.forEach((reason) => {
      expect(getByText(reason)).toBeTruthy();
    });
  });
  it("selects a reason when clicked", () => {
    const { getByText } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );
    // we can't directly test state, but we can infer the selection happened
    // by checking if submit button becomes enabled, which we'll test separately
    fireEvent.press(getByText("Prohibited item"));
  });
  it("Submit button is disabled initially", () => {
    const { getByTestId } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );

    const submitButton = getByTestId("submit-report-button");

    // TouchableOpactiy doesn't have a disabled prop which is why we need accessiblityState
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
  });
  it("Submit button is enabled after selecting a reason", () => {
    const { getByTestId, getByText } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );
    fireEvent.press(getByText("Prohibited item"));
    const submitButton = getByTestId("submit-report-button");

    // TouchableOpactiy doesn't have a disabled prop which is why we need accessiblityState
    expect(submitButton.props.accessibilityState?.disabled).toBe(false);
  });
  it("calls onClose when Cancel button is pressed", () => {
    const { getByText } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );

    fireEvent.press(getByText("Cancel"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  it("calls toggleReport and closes modal when submitting with selected reason", async () => {
    const { getByText } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );

    fireEvent.press(getByText("Prohibited item"));
    fireEvent.press(getByText("Submit"));

    await waitFor(() => {
      expect(mockToggleReport).toHaveBeenCalledWith(
        mockItemId,
        mockAuthToken,
        "Prohibited item"
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
  it("handles submission when no auth token is available", async () => {
    // override the authtoken and set to null for this test
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "",
    });
    const { getByText } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );

    fireEvent.press(getByText("Scam or fraud"));
    fireEvent.press(getByText("Submit"));

    await waitFor(() => {
      expect(mockToggleReport).toHaveBeenCalledWith(
        mockItemId,
        "",
        "Scam or fraud"
      );
    });
  });
  it("shows loading indicator while submitting", async () => {
    // create a promise that we can resolve manually to control the timing
    let resolveToggleReport: () => void = () => {};
    const toggleReportPromise = new Promise<void>((resolve) => {
      resolveToggleReport = resolve;
    });

    // mock the toggleReport to return our controlled promise
    mockToggleReport.mockImplementation(() => {
      return toggleReportPromise;
    });

    const { getByText, getByTestId } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );

    fireEvent.press(getByText("Other"));
    fireEvent.press(getByTestId("submit-report-button"));

    const activityIndicator = getByTestId("activity-indicator");
    expect(activityIndicator).toBeTruthy();

    // Resolve the promise to complete the submission
    resolveToggleReport();

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
  test("handles error during submission", async () => {
    // mock console.error to prevent actual logging
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // mock Alert.alert
    jest.spyOn(Alert, "alert");

    // mock toggleReport to throw an error
    mockToggleReport.mockImplementation(() => {
      throw new Error("Network error");
    });

    const { getByText } = render(
      <ReportModal isVisible={true} onClose={mockOnClose} itemId={mockItemId} />
    );

    fireEvent.press(getByText("Misleading description"));
    fireEvent.press(getByText("Submit"));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error reporting item:",
        expect.any(Error)
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to report item. Please try again."
      );
    });

    // restore console.error
    console.error = originalConsoleError;
  });
});
