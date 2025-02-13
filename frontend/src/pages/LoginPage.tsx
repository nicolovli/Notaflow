import Button from "@mui/material/Button";
import { AuthLogin } from "../components/Login";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md border-indigo-400 border-2 rounded-md">
        <h1 style={{marginTop: "10px"}} className="text-3xl text-center text-indigo-600">Logg inn</h1>
        <AuthLogin />
        <div className="text-center">
          <Button sx={{ marginTop: "10px", marginBottom: "10px" }} variant="outlined" color="secondary" onClick={() => navigate('/Registration')}>Lag ny bruker</Button>
        </div>
      </div>
    </div>
  );
};