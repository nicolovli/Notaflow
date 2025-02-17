import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Config/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateEmail, updatePassword } from "firebase/auth";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";

type FirebaseErrorLike = {
  code: string;
  message: string;
};

const ProfilePage: React.FC = () => {
  // User Infomration
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Feedback messages
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string>("");
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string>("");

  // Password update 
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState<string>("");
  const [passwordUpdateError, setPasswordUpdateError] = useState<string>("");

  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // Get userdata from firestore
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || "");
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setUsername(data.username || "");
          }
        } catch (error) {
          console.error("Feil ved henting av brukerdata", error);
        }
      };
      fetchUserData();
    } else {
      // If user is not logged in, navigate to login
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Function to update email and username
  const handleUpdateInfo = async () => {
    setUpdateErrorMessage("");
    setUpdateSuccessMessage("");
    try {
      // Update email in firebase if it is changes
      if (currentUser && email !== currentUser.email) {
        await updateEmail(currentUser, email);
      }
      // Update username in firebase
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, { username }, { merge: true });
      }
      setUpdateSuccessMessage("Oppdatering vellykket!");
    } catch (error: unknown) {
      const err = error as FirebaseErrorLike;
      console.error("Feil ved registrering:", err.message);
      setUpdateErrorMessage("Kunne ikke oppdatere informasjonen: " + err.message);
    }
  };

  // Update password
  const handlePasswordUpdate = async () => {
    setPasswordUpdateError("");
    setPasswordUpdateSuccess("");

    // Password length validation
    if (newPassword.length < 6) {
      setPasswordUpdateError("Passordet må være minst 6 tegn");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordUpdateError("Passordene stemmer ikke overens");
      return;
    }
    try {
      if (currentUser) {
        await updatePassword(currentUser, newPassword);
        setPasswordUpdateSuccess("Passord oppdatert!");
        // Empty fields after update password
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error: unknown) {
      const err = error as FirebaseErrorLike;
      console.error("Feil ved registrering:", err.message);
      setPasswordUpdateError("Kunne ikke oppdatere passord: " + err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Min profil
      </Typography>
      <TextField
        label="Fornavn"
        value={firstName}
        fullWidth
        margin="normal"
        disabled
      />
      <TextField
        label="Etternavn"
        value={lastName}
        fullWidth
        margin="normal"
        disabled
      />
      <TextField
        label="Brukernavn"
        value={username}
        fullWidth
        margin="normal"
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="E-post"
        value={email}
        fullWidth
        margin="normal"
        onChange={(e) => setEmail(e.target.value)}
      />
      {updateSuccessMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {updateSuccessMessage}
        </Alert>
      )}
      {updateErrorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {updateErrorMessage}
        </Alert>
      )}
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleUpdateInfo}>
        Oppdater info
      </Button>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Oppdater passord
        </Typography>
        <TextField
          label="Nytt passord"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          label="Bekreft nytt passord"
          type="password"
          fullWidth
          margin="normal"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
        {passwordUpdateSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {passwordUpdateSuccess}
          </Alert>
        )}
        {passwordUpdateError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {passwordUpdateError}
          </Alert>
        )}
        <Button variant="contained" sx={{ mt: 2 }} onClick={handlePasswordUpdate}>
          Oppdater passord
        </Button>
      </Box>
    </Box>
  );
};

export default ProfilePage