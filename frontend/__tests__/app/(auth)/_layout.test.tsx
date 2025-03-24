// Test suite for AuthLayout component
import AuthLayout from "@/app/(auth)/_layout";
import { render } from "@testing-library/react-native";
import { Stack } from "expo-router";
import { Text } from "react-native";
// Mock expo-router
jest.mock("expo-router", () => ({
  //replace the expo-router module with stack?
  //create a jest mock function and assign it to Stack
  Stack: jest.fn(() => null), //return null bc now when AuthLayout uses Stack, it'll use this mock function which does nothing & returns null
}));

describe("AuthLayout Component", () => {
  //name of the test
  it("renders correctly with children", () => {
    //it aka. test
    const childComponent = <Text>Child Component</Text>; //create a child component to be rendered within AuthLayout

    //render function from RTL to render AuthLayout, passing childComponent as its child
    //getByText is a function from RTL to find element in the rendered output by text
    const { getByText } = render(<AuthLayout>{childComponent}</AuthLayout>);

    // Verify child is rendered
    expect(getByText("Child Component")).toBeTruthy(); //toBeTruthy means it's not null kinda

    // Verify Stack is called with correct options
    expect(Stack).toHaveBeenCalledWith(
      //stack is being called with something...
      expect.objectContaining({
        //checking the exact objects stack was called with
        screenOptions: {
          headerShown: false,
          gestureEnabled: false,
        },
      }),
      expect.anything() //for a second argument stack was called with i.e. { children }
    );
  });
});
