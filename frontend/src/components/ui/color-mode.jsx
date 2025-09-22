"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ColorModeContext = createContext({});

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return context;
}

export function ColorModeProvider(props) {
  const { children } = props;
  const [colorMode, setColorMode] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("chakra-ui-color-mode");
    if (stored) {
      setColorMode(stored);
    }
  }, []);

  const toggleColorMode = () => {
    const newMode = colorMode === "light" ? "dark" : "light";
    setColorMode(newMode);
    localStorage.setItem("chakra-ui-color-mode", newMode);
  };

  const value = {
    colorMode,
    setColorMode,
    toggleColorMode,
  };

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}
