import DangerModal from "@/components/DangerModal";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("DangerModal", () => {
  it("should not render when isVisible is false", () => {
    const { queryByText } = render(
      <DangerModal
        isVisible={false}
        onClose={() => {}}
        dangerMessage="Test message"
        dangerOption1="Delete"
      />
    );

    expect(queryByText("Test message")).toBeNull();
  });
  it("should render when isVisible is true", () => {
    const { getByText } = render(
      <DangerModal
        isVisible={true}
        onClose={() => {}}
        dangerMessage="Test message"
        dangerOption1="Delete"
      />
    );

    expect(getByText("Test message")).toBeTruthy();
    expect(getByText("Delete")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });
  it("should display the correct dangerMessage", () => {
    const { getByText } = render(
      <DangerModal
        isVisible={true}
        onClose={() => {}}
        dangerMessage="Custom warning message"
        dangerOption1="Delete"
      />
    );

    expect(getByText("Custom warning message")).toBeTruthy();
  });

  it("should display the correct dangerOption1 text", () => {
    const { getByText } = render(
      <DangerModal
        isVisible={true}
        onClose={() => {}}
        dangerMessage="Warning"
        dangerOption1="Custom action"
      />
    );

    expect(getByText("Custom action")).toBeTruthy();
  });

  // interaction tests
  it("should call onClose when Cancel button is pressed", () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <DangerModal
        isVisible={true}
        onClose={onCloseMock}
        dangerMessage="Warning"
        dangerOption1="Delete"
      />
    );

    fireEvent.press(getByText("Cancel"));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should call onDone when dangerOption1 button is pressed", () => {
    const onDoneMock = jest.fn();
    const consoleSpy = jest.spyOn(console, "log");
    const { getByText } = render(
      <DangerModal
        isVisible={true}
        onClose={() => {}}
        onDone={onDoneMock}
        dangerMessage="Warning"
        dangerOption1="Delete"
      />
    );

    fireEvent.press(getByText("Delete"));
    expect(onDoneMock).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("this guys crazy..");
    consoleSpy.mockRestore();
  });

  it("should handle missing onDone prop gracefully", () => {
    const consoleSpy = jest.spyOn(console, "log");
    const { getByText } = render(
      <DangerModal
        isVisible={true}
        onClose={() => {}}
        dangerMessage="Warning"
        dangerOption1="Delete"
      />
    );

    // this should not throw an error even though onDone is undefined
    fireEvent.press(getByText("Delete"));
    expect(consoleSpy).toHaveBeenCalledWith("this guys crazy..");
    consoleSpy.mockRestore();
  });

  // edge cases
  it("should handle empty string props", () => {
    const { getByTestId } = render(
      <DangerModal
        isVisible={true}
        onClose={() => {}}
        dangerMessage=""
        dangerOption1=""
      />
    );

    // even with empty strings, elements should render
    expect(getByTestId("danger-message")).toBeTruthy();
    expect(getByTestId("danger-option")).toBeTruthy();
  });
});
