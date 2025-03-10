import { Snackbar } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const GlobalSnackbar = () => {
  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const message = location.state?.message || window.history.state?.usr?.message;
    if (message) {
      setSnackbarMessage(message);
      setSnackbarOpen(true);

      window.history.replaceState({ ...window.history.state, usr: null }, "");
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
