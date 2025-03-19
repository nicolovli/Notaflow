import { IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme } from "../context/ThemeContext"; 

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle theme">
      {isDark ? (
        <LightModeIcon sx={{ fontSize: 30 }} />
      ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: '50%', padding: '3px' }}>
              <DarkModeIcon sx={{ fontSize: 30, color: 'black' }} />
          </div>
      )}
    </IconButton>
  );
};
