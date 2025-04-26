export interface ItemType {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  additional_images: string[];
  is_sold: boolean;
  created_at: string;
  category: number;
  category_name: string;
  seller: number;
  is_favorited: boolean; // this is a separate field on the frontend for each user
  is_reported: boolean; // this is a separate field on the frontend for each user
  purchase_requests: number;
  purchase_request_count: number;
  // purchase_requesters?: Array<{ id: number; username: string }>;
}

export interface PurchaseRequest {
  id: number;
  listing: ItemType;
  requester: number;
  requester_name: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
  is_active: boolean;
}

export interface CategoryType {
  id: number;
  name: string;
}

export interface OtpScreenProps {
  email: string;
  otp: string;
}

export interface UserInfo {
  email: string;
  id: number;
  profile_picture: string;
}

// for faq page later
export interface faqItem {
  id: number;
  question: string;
  answer: string;
}

export interface SingleItemProps {
  item: ItemType;
  showFavoritesIcon?: boolean;
}

export type ScreenId = "home" | "myItems" | "favorites" | "reported";
