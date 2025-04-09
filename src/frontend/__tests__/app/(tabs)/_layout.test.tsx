import TabLayout from "@/app/(tabs)/_layout"; // Adjust the import path as needed
import { render } from "@testing-library/react-native";
import React from "react";

// mock the expo-router for testing purposes
jest.mock("expo-router", () => {
  const React = require("react"); //import react within mock's scope

  const Tabs = ({ children, screenOptions }: any) => <>{children}</>; // takes children & screenoptions and just renders children
  const Screen = jest.fn(() => null); //screen thingy which is just kinda sitting there chilling

  return {
    __esModule: true, // just good practice
    router: {
      push: jest.fn(), //mock pushing
    },
    Tabs: Object.assign(Tabs, { Screen }), // combines Tabs & Screen mocks making Tabs.Screen available as mock
  };
});

// Mock the icon libraries
jest.mock("@expo/vector-icons", () => ({
  Ionicons: jest.fn().mockImplementation(({ name, size }) => null),
  __esModule: true,
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ name, size }) => null),
}));

describe("TabLayout Component", () => {
  // Just makin' sureeee
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders tabs with correct configuration", async () => {
    const component = render(<TabLayout />); // render tablayout using mocked env & store in component

    // Changed this cause tabs.default wasn't being used anymore
    const { Tabs } = require("expo-router");
    expect(Tabs.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "index",
        options: expect.objectContaining({
          title: "Home",
        }),
      }),
      expect.anything()
    );

    // Verify each Tab.Screen was created with the correct props
    expect(Tabs.Screen).toHaveBeenCalledWith(
      //called w/ specific args
      expect.objectContaining({
        // this will check the type of the object being received
        name: "index",
        options: expect.objectContaining({
          title: "Home",
          tabBarIcon: expect.any(Function),
        }),
      }),
      expect.anything() //rest of the stuff being passed on
    );

    expect(Tabs.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "notifications",
        options: expect.objectContaining({
          title: "Notification",
          tabBarIcon: expect.any(Function),
        }),
      }),
      expect.anything()
    );

    expect(Tabs.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "additem",
        options: expect.objectContaining({
          title: "Add Item",
          tabBarIcon: expect.any(Function),
        }),
      }),
      expect.anything()
    );

    expect(Tabs.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "favorites",
        options: expect.objectContaining({
          title: "Favorites",
          tabBarBadge: 3,
          tabBarIcon: expect.any(Function),
        }),
      }),
      expect.anything()
    );

    expect(Tabs.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "profile",
        options: expect.objectContaining({
          title: "Profile",
          tabBarIcon: expect.any(Function),
        }),
      }),
      expect.anything()
    );
  });
});
