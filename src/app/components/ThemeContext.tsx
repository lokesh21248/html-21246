import { createContext, useContext, useState, ReactNode } from "react";

type Theme = "blue" | "purple" | "green";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("blue");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export const themeColors = {
  blue: {
    primary: "bg-blue-600 hover:bg-blue-700",
    primaryText: "text-blue-600",
    primaryBg: "bg-blue-50",
    gradient: "from-blue-600 to-blue-800",
    light: "bg-blue-100 text-blue-800",
    ring: "ring-blue-500",
    border: "border-blue-500",
  },
  purple: {
    primary: "bg-purple-600 hover:bg-purple-700",
    primaryText: "text-purple-600",
    primaryBg: "bg-purple-50",
    gradient: "from-purple-600 to-purple-800",
    light: "bg-purple-100 text-purple-800",
    ring: "ring-purple-500",
    border: "border-purple-500",
  },
  green: {
    primary: "bg-emerald-600 hover:bg-emerald-700",
    primaryText: "text-emerald-600",
    primaryBg: "bg-emerald-50",
    gradient: "from-emerald-600 to-emerald-800",
    light: "bg-emerald-100 text-emerald-800",
    ring: "ring-emerald-500",
    border: "border-emerald-500",
  },
};
