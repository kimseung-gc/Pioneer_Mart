import { NotificationContextType } from "@/types/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { notificationsApi } from "@/services/notificationsApi";

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnreadCount: () => {},
  resetUnreadCount: () => {},
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { authToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    if (!authToken) return;
    const count = await notificationsApi.getUnreadCount(authToken);
    setUnreadCount(count);
  };

  const resetUnreadCount = async () => {
    if (!authToken) return;
    await notificationsApi.resetUnreadCount(authToken);
    setUnreadCount(0);
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [authToken]);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshUnreadCount, resetUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
