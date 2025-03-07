import { Snackbar } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const GlobalSnackbar = () => {
  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setSnackbarMessage(location.state.message);
      setSnackbarOpen(true);

      window.history.replaceState({}, "");
    }
  }, [location]);

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
