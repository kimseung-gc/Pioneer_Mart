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
  item_id: number | null;
  item_title: string | null;
  user1: { id: number; username: string };
  user2: { id: number; username: string };
  created_at: string;
  message_count: number;
  unread_count?: number;
  last_message_time?: string;
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
