import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AddItemScreen from "../../../app/(tabs)/additem";

// Mocks

// jest.mock("expo-font", () => ({
//   useFonts: () => [true, null],
//   loadAsync: jest.fn(() => Promise.resolve()),
//   isLoaded: jest.fn(() => true), // <-- Add this line
// }));

jest.mock("axios");
import axios from "axios";

// Mock an api call to get data
(axios.get as jest.Mock).mockResolvedValue({
  data: {
    results: [{ id: 1, email: "funnyperson@example.com" }],
  },
});

// Mock the api call to post data
(axios.post as jest.Mock).mockResolvedValue({ status: 201 });

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "test-image-uri" }],
    })
  ),
}));
jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({ authToken: "test-token" }),
}));

// Silence alert calls
global.alert = jest.fn(); //can't use spyOn

describe("AddItemScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form inputs correctly", () => {
    const { getByPlaceholderText, getByText } = render(<AddItemScreen />);

    expect(getByText("Add New Item")).toBeTruthy();
    expect(getByPlaceholderText("Item name")).toBeTruthy();
    expect(getByPlaceholderText("Item Description")).toBeTruthy();
    expect(getByPlaceholderText("0.00")).toBeTruthy();
    expect(getByText("Gallery")).toBeTruthy();
    expect(getByText("Camera")).toBeTruthy();
  });

  it("updates form fields on input", () => {
    const { getByPlaceholderText } = render(<AddItemScreen />);

    const nameInput = getByPlaceholderText("Item name");
    fireEvent.changeText(nameInput, "New Chair");

    expect(nameInput.props.value).toBe("New Chair");
  });

  // it("allows selecting an image", async () => {
  //   const { getByText, findByTestId } = render(<AddItemScreen />);

  //   fireEvent.press(getByText("Tap to select an image"));

  //   await waitFor(() => {
  //     expect(findByTestId("image")).toBeTruthy();
  //   });
  // });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
});
