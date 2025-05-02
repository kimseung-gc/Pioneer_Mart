import { theme } from "@/constants/Colors";
import React, { createContext, useContext } from "react";

const ThemeContext = createContext(theme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
