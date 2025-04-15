import { ItemType, UserInfo } from "./types";

export interface User {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  item: ItemType;
  user1: { id: number; username: string };
  user2: { id: number; username: string };
  created_at: string;
  message_count: number;
}

export interface WebSocketMessage {
  message: string;
  user_id: number | undefined;
  username?: string;
}

export interface ChatScreenRouteParams {
  roomId: string;
  roomName: string;
}

export interface ChatRoomsScreenRouteParams {}
