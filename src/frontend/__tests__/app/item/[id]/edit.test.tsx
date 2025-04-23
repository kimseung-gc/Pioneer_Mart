import { useAuth } from "@/app/contexts/AuthContext";
import EditItem from "@/app/item/[id]/edit";
import { useItemsStore } from "@/stores/useSearchStore";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert } from "react-native";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/stores/useSearchStore", () => ({
  useItemsStore: {
    getState: jest.fn().mockReturnValue({
      updateItem: jest.fn(),
    }),
  },
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/components/CameraModal", () => "CameraModal");

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// custom alert mock
jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    buttons[0].onPress();
  }
});

describe("EditItem Component", () => {
  const mockOriginalItem = {
    id: 1,
    title: "Test Item",
    description: "Test description",
    price: "10.99",
    category: "electronics",
    image: "https://example.com/image.jpg",
    additional_images: [
      { image: "https://example.com/image2.jpg" },
      { image: "https://example.com/image3.jpg" },
    ],
  };
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      item: JSON.stringify(mockOriginalItem),
    });

    (useAuth as jest.Mock).mockReturnValue({
      authToken: "test-token",
    });

    (axios.put as jest.Mock).mockResolvedValue({
      data: { ...mockOriginalItem, title: "Updated Item" },
    });
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://new-image.jpg" }],
    });
  });
  it("renders form with original item data", () => {
    const { getByText, getByDisplayValue } = render(<EditItem />);

    expect(getByDisplayValue("Test Item")).toBeTruthy();
    expect(getByDisplayValue("Test description")).toBeTruthy();
    expect(getByDisplayValue("10.99")).toBeTruthy();
    expect(getByText("Electronics")).toBeTruthy();
  });
  it("updates form fields when user types", () => {
    const { getByDisplayValue } = render(<EditItem />);

    const titleInput = getByDisplayValue("Test Item");
    fireEvent.changeText(titleInput, "Updated Title");
    expect(getByDisplayValue("Updated Title")).toBeTruthy();

    const descriptionInput = getByDisplayValue("Test description");
    fireEvent.changeText(descriptionInput, "Updated description");
    expect(getByDisplayValue("Updated description")).toBeTruthy();

    const priceInput = getByDisplayValue("10.99");
    fireEvent.changeText(priceInput, "25.99");
    expect(getByDisplayValue("25.99")).toBeTruthy();
  });
  it("opens and selects category from dropdown", async () => {
    const { getByText, getByTestId } = render(<EditItem />);

    // open dropdown
    const categorySelector = getByTestId("category-selector");
    fireEvent.press(categorySelector);

    // select a different category
    const clothingOption = getByText("Clothing");
    fireEvent.press(clothingOption);

    // verify dropdown closed and new category selected
    expect(getByText("Clothing")).toBeTruthy();
  });
  it("loads images correctly from original item", async () => {
    const { findByText } = render(<EditItem />);

    // check that it shows 3 images are selected (1 main + 2 additional)
    expect(await findByText("Images * (3 selected)")).toBeTruthy();
  });
  it("adds new image from gallery", async () => {
    const { getByText, findByText } = render(<EditItem />);

    // press gallery button
    const galleryButton = getByText("Gallery");
    await act(async () => {
      fireEvent.press(galleryButton);
    });

    // should now show 4 images (3 original + 1 new)
    expect(await findByText("Images * (4 selected)")).toBeTruthy();
  });
  it("handles image permission denial", async () => {
    // Mock permission denied
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "denied",
      canAskAgain: true,
    });

    const { getByText } = render(<EditItem />);

    // press gallery button
    const galleryButton = getByText("Gallery");
    await act(async () => {
      fireEvent.press(galleryButton);
    });

    // alert should be called with permission message
    expect(Alert.alert).toHaveBeenCalledWith(
      "Permission needed",
      "Please allow access to your photo library"
    );
  });
  it("removes an image when remove icon is pressed", async () => {
    const { findByText, getAllByTestId } = render(<EditItem />);

    // wait for initial images to load
    await findByText("Images * (3 selected)");

    // get all remove buttons and press the first one
    const removeButtons = getAllByTestId("remove-image-button");
    fireEvent.press(removeButtons[0]);

    // should now show 2 images
    await findByText("Images * (2 selected)");
  });
  it("submits form with edited data and navigates back on success", async () => {
    const { getByText, getByDisplayValue } = render(<EditItem />);

    // edit the title
    const titleInput = getByDisplayValue("Test Item");
    fireEvent.changeText(titleInput, "Updated Title");

    // submit the form
    const saveButton = getByText("Save Item");
    await act(async () => {
      fireEvent.press(saveButton);
    });
    expect(axios.put).toHaveBeenCalled();
    expect(axios.put).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );

    // check if navigation happened
    expect(router.back).toHaveBeenCalled();
    expect(router.setParams).toHaveBeenCalledWith({
      item: expect.any(String),
      refreshKey: expect.any(String),
    });

    // check if store was updated
    expect(useItemsStore.getState().updateItem).toHaveBeenCalled();
  });
  it("shows validation error when required fields are missing", async () => {
    const { getByText, getByDisplayValue } = render(<EditItem />);

    // clear required fields
    const titleInput = getByDisplayValue("Test Item");
    fireEvent.changeText(titleInput, "");

    // submit the form
    const saveButton = getByText("Save Item");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    // check if validation alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
      "Validation Error",
      "Please fill in all required fields."
    );

    // API should not have been called
    expect(axios.put).not.toHaveBeenCalled();
  });
  it("shows error alert when API call fails", async () => {
    // mock API failure
    (axios.put as jest.Mock).mockRejectedValue(new Error("API Error"));

    const { getByText } = render(<EditItem />);

    // submit the form
    const saveButton = getByText("Save Item");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    // check if error alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Could not edit item. Please try again later."
    );
  });
  //   it("displays loading indicator while submitting", async () => {
  //     // Mock a delayed API response
  //     (axios.put as jest.Mock).mockImplementation(
  //       () =>
  //         new Promise((resolve) =>
  //           setTimeout(() => resolve({ data: mockOriginalItem }), 100)
  //         )
  //     );

  //     const { getByText, findByTestId } = render(<EditItem />);

  //     // Submit the form
  //     const saveButton = getByText("Save Item");
  //     fireEvent.press(saveButton);

  //     // Check for loading indicator
  //     const loadingIndicator = await findByTestId("activity-indicator");
  //     expect(loadingIndicator).toBeTruthy();

  //     // Complete the request
  //     await waitFor(() => expect(axios.put).toHaveBeenCalled());
  //   });
});
