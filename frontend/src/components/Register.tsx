import { useState } from "react";
import { auth } from "../Config/firebase-config.ts";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const AuthRegister: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const signIn = async (): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registrering vellykket:", auth.currentUser?.email);
    } catch (err) {
      console.error("Feil ved registrering:", err);
    }
  };
  console.log(auth?.currentUser?.email);

  return (
    <div>
      <input placeholder="Email..." type="email" onChange={(e) => setEmail(e.target.value)} />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signIn}> Registrer</button>
    </div>
  );
};
