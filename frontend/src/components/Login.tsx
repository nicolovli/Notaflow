import { useState } from "react";
import { auth } from "../Config/firebase-config.ts";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

export const AuthLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const signIn = async (): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Innlogging vellykket:", auth.currentUser?.email);
      navigate("/Dashboard");
    } catch (err) {
      console.error("Feil ved innlogging:", err);
    }
  };
  console.log(auth?.currentUser?.email);

  return (
    <div className="flex flex-col items-center">
      <Box 
        component="form" 
        sx={{ display: "flex", 
        flexDirection: "column", 
        gap: 2, width: "300px", 
        margin: "auto", 
        marginTop: 5,
        }}
        padding="16px"
      >
      <TextField
        placeholder="Epost" 
        type="email" 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <TextField
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
     </Box>
      <Button sx={{margin: "10px", width: "150px"}} color="primary" variant="contained" onClick={signIn}> Logg inn</Button>
    </div>
  );
};