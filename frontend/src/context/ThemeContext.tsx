import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";
  import {
    createTheme,
    ThemeProvider as MuiThemeProvider,
  } from "@mui/material/styles";
  import { CssBaseline } from "@mui/material";
  
  interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
  }
  
  const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
  
  export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
      throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
  };
  
  export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    // Start med å sjekke localStorage eller systeminnstilling
    const [isDark, setDarkMode] = useState(() => {
      if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) return savedTheme === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false;
    });
  
    useEffect(() => {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);
  
    const toggleTheme = () => setDarkMode((prev) => !prev);
  
    const muiTheme = createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        primary: { main: "#1976d2" },
        background: {
          default: isDark ? "#212529" : "#f9f9f9",
          paper: isDark ? "#2a2a2a" : "#ffffff",
        },
        text: {
          primary: isDark ? "#e9ecef" : "#333333",
        },
      },
    });
  
    // Return the context + MUIs ThemeProvider 
    return (
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </ThemeContext.Provider>
    );
  };
  
  export const useDarkMode = () => useContext(ThemeContext);
  