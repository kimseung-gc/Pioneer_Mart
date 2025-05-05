import TabLayout from "@/app/(tabs)/_layout"; // Adjust the import path as needed
import { useAuth } from "@/app/contexts/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import React from "react";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("expo-router", () => {
  const React = require("react");
  // Add proper type annotation for the children parameter
  const Tabs = ({
    children,
    screenOptions,
  }: {
    children: React.ReactNode;
    screenOptions?: any;
  }) => <>{children}</>;
  const Screen = jest.fn(() => null);

  // add Stack mock separately cause tabs testing is being weird
  const Stack = { Screen: jest.fn(() => null) };

  return {
    __esModule: true,
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      setParams: jest.fn(),
    },
    Tabs: Object.assign(Tabs, { Screen }),
    Stack: Stack,
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
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "test-token",
    });
  });

  it("renders tabs with correct configuration", async () => {
    const component = render(
      <NavigationContainer>
        <TabLayout />
      </NavigationContainer>
    ); // render tablayout using mocked env & store in component

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
          tabBarIcon: expect.any(Function),
        }),
      }),
      expect.anything()
    );

    expect(Tabs.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "settings",
        options: expect.objectContaining({
          title: "Settings",
          tabBarIcon: expect.any(Function),
        }),
      }),
      expect.anything()
    );
  });
});
