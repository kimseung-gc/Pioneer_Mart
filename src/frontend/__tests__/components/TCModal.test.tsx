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
    expect(window.alert).toHaveBeenCalledWith(
      "You must accept the terms and conditions to continue using the platform."
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
  it("renders intro and expands all sections with correct content", () => {
    const { getByText, getByTestId } = render(
      <TCModal
        isVisible={true}
        termsAccepted={false}
        onAccept={mockOnAccept}
        onClose={mockOnClose}
      />
    );

    // Intro text
    expect(
      getByText(
        /By creating an account, you agree to the following terms and conditions/
      )
    ).toBeTruthy();

    // --- Section 1 ---
    fireEvent.press(getByTestId("section-eligibility"));
    expect(
      getByText(
        /You must be a current Grinnell student with a valid Grinnell email address/
      )
    ).toBeTruthy();

    // --- Section 2 ---
    fireEvent.press(getByTestId("section-userContent"));
    expect(
      getByText(
        /All content \(images, descriptions, messages, chats\) is subject to moderation/
      )
    ).toBeTruthy();

    // --- Section 3 ---
    fireEvent.press(getByTestId("section-dataPrivacy"));
    expect(getByText(/We collect and store/)).toBeTruthy();
    expect(getByText(/Your Grinnell email address/)).toBeTruthy();

    // --- Section 4 ---
    fireEvent.press(getByTestId("section-userResponsibility"));
    expect(
      getByText(
        /You are responsible for all activities that occur under your account/
      )
    ).toBeTruthy();

    // --- Section 5 ---
    fireEvent.press(getByTestId("section-liability"));
    expect(
      getByText(/We operate as a platform for connecting buyers and sellers/)
    ).toBeTruthy();

    // Update date note
    expect(getByText(/Last updated: May 4, 2025/)).toBeTruthy();
  });
  it("can find the accept button using testID", () => {
    const { getByTestId, getByText } = render(
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
    expect(window.alert).toHaveBeenCalledWith(
      "You must accept the terms and conditions to continue using the platform."
    );
  });
});
