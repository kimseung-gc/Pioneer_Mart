import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Categories from "../../components/Categories";
import { useItemsStore } from "@/stores/useSearchStore";

jest.mock("@/stores/useSearchStore");

describe("Categories Component", () => {
  const mockFilterByCategory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useItemsStore as unknown as jest.Mock).mockReturnValue({
      screens: {
        home: {
          selectedCategory: null,
        },
      },
      filterByCategory: mockFilterByCategory,
    });
  });

  const categories = [
    { id: 1, name: "Books" },
    { id: 2, name: "Electronics" },
  ];

  it("renders the title and all category", () => {
    const { getByText } = render(
      <Categories screenId="home" categories={categories} />
    );

    expect(getByText("Categories")).toBeTruthy();
    expect(getByText("All")).toBeTruthy();
    expect(getByText("Books")).toBeTruthy();
    expect(getByText("Electronics")).toBeTruthy();
  });

  it("calls filterByCategory with null when 'All' is pressed", () => {
    const { getByText } = render(
      <Categories screenId="home" categories={categories} />
    );

    fireEvent.press(getByText("All"));
    expect(mockFilterByCategory).toHaveBeenCalledWith("home", null);
  });

  it("calls filterByCategory with category id when a category is pressed", () => {
    const { getByText } = render(
      <Categories screenId="home" categories={categories} />
    );

    fireEvent.press(getByText("Books"));
    expect(mockFilterByCategory).toHaveBeenCalledWith("home", 1);

    fireEvent.press(getByText("Electronics"));
    expect(mockFilterByCategory).toHaveBeenCalledWith("home", 2);
  });

  it("applies selected style when a category is selected", () => {
    (useItemsStore as unknown as jest.Mock).mockReturnValue({
      screens: {
        home: {
          selectedCategory: 2,
        },
      },
      filterByCategory: mockFilterByCategory,
    });

    const { getByText } = render(
      <Categories screenId="home" categories={categories} />
    );

    const selected = getByText("Electronics");
    expect(selected.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: "white" }),
        expect.objectContaining({ fontWeight: "600" }),
      ])
    );
  });
});
