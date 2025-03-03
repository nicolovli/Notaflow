import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Config/firebase-config.ts";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { Box, Button, TextField, Alert, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type FirebaseErrorLike = {
  code: string;
  message: string;
};

export const AuthRegister: React.FC = () => {
  // Auth fields
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Extra user info
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  // Error fields
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Success feedback state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility state
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  // Regex for easy email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Toogle password visibility
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Check if username is uniqe
  const checkUsernameAvailability = async (username: string) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const register = async (): Promise<void> => {
    if (isLoading) return;

    console.log(auth?.currentUser?.email || "Ingen bruker er logget inn");
    // Empty previous errors
    setEmailError(null);
    setPasswordError(null);
    setFirstNameError(null);
    setLastNameError(null);
    setUsernameError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Flag to check if any error happens
    let hasError = false;

    // Validates email
    if (!isValidEmail(email)) {
      setEmailError("Ugyldig e-postadresse");
      hasError = true;
    }

    // Validates password
    if (password.length < 6) {
      setPasswordError("Passordet må være minst 6 tegn");
      hasError = true;
    }

    // Check confirmation password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passordene samsvarer ikke");
      hasError = true;
    }

    // Validates last name
    if (lastName.length <= 0) {
      setLastNameError("Ugyldig etternavn. Må være minst 1 tegn");
      hasError = true;
    }

    // Validates first name
    if (firstName.length <= 0) {
      setFirstNameError("Ugyldig fornavn. Må være 1 tegn eller mer");
      hasError = true;
    }

    // Validates username
    if (username.length < 3) {
      setUsernameError("Brukernavn må være minst 3 tegn.");
      hasError = true;
    } else {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setUsernameError("Brukernavnet er allerede tatt.");
        hasError = true;
      }
    }

    // If error happens, stop further action
    if (hasError) {
      setIsLoading(false);
      return;
    }

    try {
      // Create user with e-mail and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log("Registrering vellykket:", auth.currentUser?.email);

      // Add additional user information in firestore with UID as document-id
      await setDoc(doc(db, "users", uid), {
        firstName: firstName,
        lastName: lastName,
        username: username,
        isAdmin: false
      });
      console.log("Brukerdata lagret i Firestore:", auth.currentUser?.email);

      // Give feedback about successful registration and redirect to dashboard
      setSuccessMessage("Registrering vellykket. Du blir nå redirectet til hovedsiden.");
      setTimeout(() => {
        navigate("/Dashboard");
      }, 2000);
    } catch (error: unknown) {
      const err = error as FirebaseErrorLike;
      console.error("Feil ved registrering:", err.message);
      setEmailError(
        err.code === "auth/email-already-in-use"
          ? "E-postadressen er allerede i bruk"
          : "Noe gikk galt. Prøv igjen senere."
      );
    } finally {
      setIsLoading(true);
    }
  };

  return (
    <div>
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "300px",
          margin: "auto",
          marginTop: 5,
        }}
        padding="16px">
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        <TextField
          required
          placeholder="Fornavn"
          error={!!firstNameError}
          helperText={firstNameError || ""}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          required
          placeholder="Etternavn"
          error={!!lastNameError}
          helperText={lastNameError || ""}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          required
          placeholder="Brukernavn"
          error={!!usernameError}
          helperText={usernameError || ""}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          required
          error={!!emailError}
          helperText={emailError || ""}
          placeholder="E-post"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          required
          error={!!passwordError}
          helperText={passwordError || ""}
          placeholder="Passord"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          required
          error={!!confirmPasswordError}
          helperText={confirmPasswordError || ""}
          placeholder="Bekreft passord"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button variant="contained" onClick={register} disabled={isLoading}>
          Registrer
        </Button>
      </Box>
    </div>
  );
};
