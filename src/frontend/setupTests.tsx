jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
global.window.alert = jest.fn();
global.window.confirm = jest.fn(() => true);

jest.mock("@expo/vector-icons/AntDesign", () => {
  return {
    __esModule: true,
    default: () => <></>,
  };
});

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock your API module
jest.mock("@/types/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

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

// jest.mock("axios");

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
// setupTests.ts (or inside test file before tests)
jest.mock("@ptomasroos/react-native-multi-slider", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ values, onValuesChange }: any) => {
      return (
        <View testID="mock-multislider">
          {/* simulate interaction if needed */}
        </View>
      );
    },
  };
});

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("axios", () => {
  // Create a mock axios instance with the methods we need
  const axiosMock = {
    create: jest.fn().mockReturnValue({
      defaults: {
        baseURL: "http://test-api-url.com",
        headers: {
          common: {},
          get: {},
          post: {},
        },
      },
      get: jest.fn().mockResolvedValue({}),
      post: jest.fn().mockResolvedValue({}),
      put: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
        },
      },
    }),
    get: jest.fn().mockResolvedValue({}),
    post: jest.fn().mockResolvedValue({}),
    put: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
  };

  return axiosMock;
});
