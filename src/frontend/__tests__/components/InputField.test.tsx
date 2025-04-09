import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import InputField from "../../components/InputField"; 

describe("InputField", () => {
  it("renders correctly", () => {
    const { getByPlaceholderText } = render(
      <InputField placeholder="Enter text" />
    );
    expect(getByPlaceholderText("Enter text")).toBeTruthy();
  });

  it("accepts text input", () => {
    const handleChange = jest.fn();
    const { getByPlaceholderText } = render(
      <InputField placeholder="Type here" onChangeText={handleChange} />
    );

    const input = getByPlaceholderText("Type here");
    fireEvent.changeText(input, "Hello");
    expect(handleChange).toHaveBeenCalledWith("Hello");
  });

  it("displays initial value", () => {
    const { getByDisplayValue } = render(
      <InputField value="Initial" onChangeText={jest.fn()} />
    );

    expect(getByDisplayValue("Initial")).toBeTruthy();
  });

  it("passes additional props (e.g., keyboardType)", () => {
    const { getByPlaceholderText } = render(
      <InputField placeholder="Email" keyboardType="email-address" />
    );

    const input = getByPlaceholderText("Email");
    expect(input.props.keyboardType).toBe("email-address");
  });
});
