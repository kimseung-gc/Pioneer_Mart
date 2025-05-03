import ChatRoomsScreen from "@/app/ChatRoomScreen";
import { useAuth } from "@/app/contexts/AuthContext";
import { useChatStore } from "@/stores/chatStore";
import { useUserStore } from "@/stores/userStore";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { router } from "expo-router";
import { RefreshControl } from "react-native";
import api from "@/types/api";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/stores/chatStore", () => ({
  useChatStore: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  Stack: {
    Screen: () => null,
  },
}));

jest.mock("@/stores/userStore", () => ({
  useUserStore: jest.fn(),
}));

const originalConsoleError = console.error;
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation((msg, ...args) => {
    if (typeof msg === "string" && msg.includes("not wrapped in act")) {
      return;
    }
    originalConsoleError(msg, ...args);
  });
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});
describe("ChatRoomsScreen", () => {
  const mockUserData = {
    id: 456,
    username: "CurrentUser",
  };

  const mockAuthToken = {
    authToken: "test-token-123",
  };

  const mockFetchUnreadCount = jest.fn();
  const mockRooms = [
    {
      id: "123",
      item_id: 789,
      item_title: "Test Item 1",
      user1: { id: 456, username: "CurrentUser" },
      user2: { id: 789, username: "OtherUser1" },
      created_at: "2023-01-01T12:00:00Z",
      message_count: 10,
      unread_count: 5,
      last_message_time: "2023-01-02T12:00:00Z",
    },
    {
      id: "456",
      item_id: 101,
      item_title: "Test Item 2",
      user1: { id: 456, username: "CurrentUser" },
      user2: { id: 101, username: "OtherUser2" },
      created_at: "2023-01-03T12:00:00Z",
      message_count: 3,
      unread_count: 0,
      last_message_time: "2023-01-04T12:00:00Z",
    },
  ];

  beforeEach(() => {
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      userData: mockUserData,
    });
    (useAuth as jest.Mock).mockReturnValue(mockAuthToken);
    (useChatStore as unknown as jest.Mock).mockReturnValue({
      fetchUnreadCount: mockFetchUnreadCount,
    });
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        rooms: mockRooms,
      },
    });

    (api.post as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the chat rooms screen with proper title", async () => {
    // we won't test the header title here cause it's part of the screen
    const { getByText } = render(
      <NavigationContainer>
        <ChatRoomsScreen route={{} as any} />
      </NavigationContainer>
    );
    // theres an async func in the focus effect so use wait for
    await waitFor(() =>
      expect(getByText("No Chat rooms available")).toBeTruthy()
    );
  });
  it("fetches and displays chat rooms", async () => {
    // we won't test the header title here cause it's part of the screen
    const { getByText, findByText } = render(
      // need the navigation container
      <NavigationContainer>
        <ChatRoomsScreen route={{} as any} />
      </NavigationContainer>
    );
    // theres an async func in the focus effect so use wait for
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/chat/rooms"),
        expect.any(Object) // get anything
      );
    });
    await findByText("OtherUser1");
    expect(getByText("Item: Test Item 1")).toBeTruthy();
    expect(getByText("10 messages")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();

    expect(getByText("OtherUser2")).toBeTruthy();
    expect(getByText("Item: Test Item 2")).toBeTruthy();
  });
  it("navigates to chat room when room is pressed", async () => {
    const { findByText } = render(
      <NavigationContainer>
        <ChatRoomsScreen route={{} as any} />
      </NavigationContainer>
    );

    const roomItem = await findByText("OtherUser1");
    fireEvent.press(roomItem);

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        pathname: "/chat/[id]",
        params: {
          id: "123",
          username: "OtherUser1",
          itemTitle: "Test Item 1",
          receiver_id: 789,
          user_id: 456,
        },
      });
    });
  });
  it("marks a room as read when entering an unread room", async () => {
    const { findByText } = render(
      <NavigationContainer>
        <ChatRoomsScreen route={{} as any} />
      </NavigationContainer>
    );

    const roomItem = await findByText("OtherUser1");
    fireEvent.press(roomItem);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/chat/rooms/123/mark-read/"),
        {},
        expect.any(Object)
      );
    });

    expect(mockFetchUnreadCount).toHaveBeenCalledWith(mockAuthToken.authToken);
  });
  it("refreshes the chat rooms list when pulled down", async () => {
    const { UNSAFE_getByType } = render(
      // unsafe cause test id wasn't working with RefreshControl component
      <NavigationContainer>
        <ChatRoomsScreen route={{} as any} />
      </NavigationContainer>
    );

    (api.get as jest.Mock).mockClear(); //make sure

    // get the refresh thingy
    const refreshControl = UNSAFE_getByType(RefreshControl);

    await act(async () => {
      fireEvent(refreshControl, "onRefresh");
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/chat/rooms/"), //make the api call and test
        expect.any(Object)
      );
    });
  });
});
