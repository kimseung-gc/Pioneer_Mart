import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ItemPurchaseModal from "../../components/ItemPurchaseModal"; 

describe("ItemPurchaseModal", () => {
  const mockEmail = "test@example.com";

  it("renders when visible", () => {
    const { getByText } = render(
      <ItemPurchaseModal isVisible={true} onClose={jest.fn()} email={mockEmail} />
    );

    expect(getByText(/We've notified the seller/i)).toBeTruthy();
    expect(getByText(mockEmail)).toBeTruthy();
    expect(getByText("Close")).toBeTruthy();
  });

  it("does not render when not visible", () => {
    const { toJSON } = render(
      <ItemPurchaseModal isVisible={false} onClose={jest.fn()} email={mockEmail} />
    );

    expect(toJSON()).toBeNull();
  });

  it("calls onClose when 'Close' button is pressed", () => {
    const onCloseMock = jest.fn();

    const { getByText } = render(
      <ItemPurchaseModal isVisible={true} onClose={onCloseMock} email={mockEmail} />
    );

    const closeButton = getByText("Close");
    fireEvent.press(closeButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
