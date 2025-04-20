jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@expo/vector-icons/AntDesign", () => {
  return {
    __esModule: true,
    default: () => <></>,
  };
});

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  return {
    __esModule: true,
    default: () => <></>,
  };
});

jest.mock("expo-font", () => ({
  useFonts: () => [true],
}));

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn().mockReturnValue(true),
}));

jest.mock("axios");

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    setParams: jest.fn(),
  },
  Stack: {
    Screen: () => null,
  },
  Tabs: {
    Screen: () => null,
  },
  useLocalSearchParams: jest
    .fn()
    .mockReturnValue({ email: "test@example.com" }),
}));
