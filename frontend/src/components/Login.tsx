import { useState } from "react";
import { auth } from "../Config/firebase-config.ts";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

type FirebaseErrorLike = {
  code: string;
  message: string;
};

export const AuthLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const signIn = async (): Promise<void> => {
    console.log(auth?.currentUser?.email || "Ingen bruker er logget inn")

    // Empty previous errors
    setEmailError(null);
    setPasswordError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Innlogging vellykket:", auth.currentUser?.email);
      navigate("/Dashboard");

    } catch (error:unknown) {
      const err = error as FirebaseErrorLike;
      console.error("Feil ved innlogging:", err.message);

      if (err.code === "auth/invalid-email") {
        setEmailError("E-postadressen er feil/finnes ikke");
      } else if (err.code === "auth/missing-password") {
        setPasswordError("Fyll inn passord");
      } else if (err.code === "auth/invalid-credential") {
        setPasswordError("Feil passord")
      } else {
        setEmailError("Noe gikk galt. Prøv igjen senere.");
      }
    }
  };

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
        required
        error={!!emailError}
        helperText={emailError || ""}
        placeholder="Epost" 
        type="email" 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <TextField
        required
        error={!!passwordError}
        helperText={passwordError || ""}
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
     </Box>
      <Button sx={{margin: "10px", width: "150px"}} color="primary" variant="contained" onClick={signIn}> Logg inn</Button>
    </div>
  );
};