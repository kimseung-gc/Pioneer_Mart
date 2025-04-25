import TCModal from "@/components/TCModal";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

jest.spyOn(Alert, "alert");

describe("TCModal Component", () => {
  const mockOnAccept = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders correctly when visible", () => {
    const { getByText } = render(
      <TCModal
        isVisible={true}
        termsAccepted={false}
        onAccept={mockOnAccept}
        onClose={mockOnClose}
      />
    );

    expect(getByText("Terms & Conditions")).toBeTruthy();
    expect(getByText("Accept")).toBeTruthy();
    expect(getByText("Close")).toBeTruthy();
  });
  it("does not render when not visible", () => {
    const { queryByText } = render(
      <TCModal
        isVisible={false}
        termsAccepted={false}
        onAccept={mockOnAccept}
        onClose={mockOnClose}
      />
    );

    expect(queryByText("Terms & Conditions")).toBeNull();
  });
  it("calls onAccept when Accept button is pressed", () => {
    const { getByText } = render(
      <TCModal
        isVisible={true}
        termsAccepted={false}
        onAccept={mockOnAccept}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText("Accept"));
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
  });
  it("shows alert when trying to close without accepting terms", () => {
    const { getByText } = render(
      <TCModal
        isVisible={true}
        termsAccepted={false}
        onAccept={mockOnAccept}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText("Close"));
    expect(Alert.alert).toHaveBeenCalledWith(
      "You must accept the terms to continue"
    );
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  it("calls onClose when Close button is pressed and terms are accepted", () => {
    const { getByText } = render(
      <TCModal
        isVisible={true}
        termsAccepted={true}
        onAccept={mockOnAccept}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText("Close"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  it("renders terms and conditions text correctly", () => {
    const { getByText } = render(
      <TCModal
        isVisible={true}
        termsAccepted={false}
        onAccept={mockOnAccept}
        onClose={mockOnClose}
      />
    );

    expect(
      getByText(
        /By creating an account, you agree to the following terms and conditions:/
      )
    ).toBeTruthy();
    expect(
      getByText(
        /1\. You must be a current Grinnell student with a valid Grinnell email address\./
      )
    ).toBeTruthy();
  });
  it("can find the accept button using testID", () => {
    const { getByTestId } = render(
      <TCModal
        isVisible={true}
        termsAccepted={false}
        onAccept={mockOnAccept}
        onClose={mockOnClose}
      />
    );

    const acceptButton = getByTestId("accept-button");
    expect(acceptButton).toBeTruthy();
    fireEvent.press(acceptButton);
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
  });
  it("handles onRequestClose prop correctly", () => {
    const { getByTestId } = render(
      <TCModal
        isVisible={true}
        termsAccepted={false}
        onAccept={mockOnAccept}
        onClose={mockOnClose}
      />
    );

    // Simulate back button press (which triggers onRequestClose)
    const modal = getByTestId("tc-modal");
    fireEvent(modal, "requestClose");
    expect(Alert.alert).toHaveBeenCalledWith(
      "You must accept the terms to continue"
    );
  });
});
