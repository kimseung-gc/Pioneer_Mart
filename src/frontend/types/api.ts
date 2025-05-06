export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
// putting this api service so that we don't need another api file
import axios from "axios";
import Constants from "expo-constants";
import { getErrorMessage } from "@/utils/errorUtils";

const api = axios.create({
  baseURL: Constants?.expoConfig?.extra?.apiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
try {
  // request interceptor to add auth token to requests
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {}
      return config;
    },
    (error) => Promise.reject(error)
  );

  // response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // if error is 401 and we haven't tried to refresh token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await AsyncStorage.getItem("refreshToken");
          if (!refreshToken) {
            // no refresh token so redirect to login
            return Promise.reject(error);
          }

          // attempt to refreesh token
          const response = await axios.post(
            `${Constants?.expoConfig?.extra?.apiUrl}/otpauth/refresh/`,
            { refresh: refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const { access, refresh } = response.data;

          // store the new tokens
          await AsyncStorage.setItem("authToken", access);
          if (refresh) {
            await AsyncStorage.setItem("refreshToken", refresh);
          }

          // retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // if the refresh fails then redirect to login
          // TODO: Maybe dispatch an action to clear auth state
          return Promise.reject(refreshError);
        }
      }

      // 2. show a user-friendly message for unhandled error
      //    but don't show toast for 401 errors we're already handling
      if (!(error.response?.status === 401 && !originalRequest._retry)) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: getErrorMessage(error) as string,
          position: "bottom",
          visibilityTime: 4000,
        });
      }

      // 3. Return the rejected promise so components can handle specific errors if needed
      return Promise.reject(error);
    }
  );
} catch (error) {
  if (__DEV__) {
    console.warn("Failed to set up API interceptors:", error);
  }
}

export default api;
