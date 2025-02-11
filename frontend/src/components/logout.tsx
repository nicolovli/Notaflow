import { auth } from "../Config/firebase-config.ts";
import { signOut } from "firebase/auth";

export const AuthLogout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error(err);
  }
};
