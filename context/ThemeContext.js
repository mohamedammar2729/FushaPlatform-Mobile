import React, { createContext, useState, useEffect, useContext } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme when app starts
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        } else {
          setIsDarkMode(deviceTheme === "dark");
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  // Define your theme colors with the enhanced dark palette
  const theme = {
    isDarkMode,
    colors: isDarkMode
      ? {
          // Dark theme with ColorHunt palette
          background: "#2D3250", // Dark navy
          surface: "#424769", // Medium navy
          primary: "#F6B17A", // Peach/orange accent
          text: "#FFFFFF", // White text
          textSecondary: "#AAB2D5", // Lighter version of blues
          card: "#424769", // Medium navy
          border: "#7077A1", // Muted purple/blue
          accent: "#F6B17A", // Peach accent
        }
      : {
          // Light theme (unchanged)
          background: "#F5F7FA",
          surface: "#FFFFFF",
          primary: "#4a72ac",
          text: "#000000",
          textSecondary: "#555555",
          card: "#FFFFFF",
          border: "#E0E0E0",
          accent: "#4a72ac",
        },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easy theme access
export const useTheme = () => useContext(ThemeContext);
