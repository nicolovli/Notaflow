import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/func/useAuth";

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) return null;

  return (
    <Fab
      color="primary"
      aria-label="add"
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 80,
        height: 80,
        backgroundColor: "#4F46E5",
        "&:hover": {
          backgroundColor: "#4338CA",
        },
      }}
      onClick={() => navigate("/PublishingPage")}>
      <AddIcon sx={{ fontSize: 40 }} />
    </Fab>
  );
};

export default FloatingActionButton;
