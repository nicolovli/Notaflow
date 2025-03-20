import { Snackbar } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GlobalSnackbar = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSnackbarEvent = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setSnackbarMessage(customEvent.detail);
      setSnackbarOpen(true);
    };

    window.addEventListener("globalSnackbar", handleSnackbarEvent);
    return () => window.removeEventListener("globalSnackbar", handleSnackbarEvent);
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setSnackbarMessage(location.state.message);
      setSnackbarOpen(true);

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={4000}
      onClose={() => setSnackbarOpen(false)}
      message={<span style={{ width: "100%", textAlign: "center" }}>{snackbarMessage}</span>}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        "& .MuiSnackbarContent-message": {
          width: "100%",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
        },
      }}
    />
  );
};

export default GlobalSnackbar;
