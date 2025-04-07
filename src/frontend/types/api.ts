import { BASE_URL } from "@/config";
import axios from "axios";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const requestPurchase = async (listingId: number, authToken: string) => {
  try {
    const cleanToken = authToken?.trim();
    const response = await axios.post(
      `${BASE_URL}/api/items/${listingId}/request_purchase/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error requesting purchase:", error);
    return false;
  }
};

export const getSentPurchaseRequests = async (authToken: string) => {
  try {
    const cleanToken = authToken?.trim();
    const response = await axios.get(`${BASE_URL}/api/requests/sent/`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting sent purchase requests:", error);
  }
};

export const getReceivedPurchaseRequests = async (authToken: string) => {
  try {
    const cleanToken = authToken?.trim();
    const response = await axios.get(`${BASE_URL}/api/requests/received/`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting received purchase requests:", error);
  }
};

export const cancelPurchaseRequest = async (
  requestId: number,
  authToken: string
) => {
  try {
    const cleanToken = authToken?.trim();
    const response = await axios.post(
      `${BASE_URL}/api/requests/${requestId}/cancel/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling purchase request:", error);
  }
};
