import { Snackbar } from "@mui/material";
import { useState, useEffect } from "react";

const GlobalSnackbar = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const handleSnackbarEvent = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setSnackbarMessage(customEvent.detail);
      setSnackbarOpen(true);
    };

    window.addEventListener("globalSnackbar", handleSnackbarEvent);
    return () => window.removeEventListener("globalSnackbar", handleSnackbarEvent);
  }, []);

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={4000}
      onClose={() => setSnackbarOpen(false)}
      message={snackbarMessage}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    />
  );
};

export default GlobalSnackbar;
