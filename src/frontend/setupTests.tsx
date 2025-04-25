jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

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
jest.mock("@expo/vector-icons/Foundation", () => {
  return {
    __esModule: true,
    default: () => <></>,
  };
});
jest.mock("@expo/vector-icons/FontAwesome", () => {
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

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  __esModule: true,
  router: {
    push: mockPush,
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
  useRouter: () => ({
    push: mockPush,
  }),
  useLocalSearchParams: jest
    .fn()
    .mockReturnValue({ email: "test@example.com" }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest
    .fn()
    .mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
