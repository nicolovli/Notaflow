import { useState } from "react";
import { auth } from "../Config/firebase-config.ts";
import { signInWithEmailAndPassword } from "firebase/auth";

export const AuthLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const signIn = async (): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Innlogging vellykket:", auth.currentUser?.email);
    } catch (err) {
      console.error("Feil ved innlogging:", err);
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
      <button onClick={signIn}> Logg inn</button>
    </div>
  );
};
