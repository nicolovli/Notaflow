import {  doc, getDoc } from "firebase/firestore";
import { db } from "../../Config/firebase-config";

import { AdditionalUserInfo } from "../interfaces/interface.userInfo"; 




export const getAdditionalUserData = async (id: string): Promise<AdditionalUserInfo> => {
 try {
      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      return {
        id: userSnap.id,
        ...userSnap.data()
      } as AdditionalUserInfo;
    } catch (error) {
      console.error("Error fetching subject:", error);
      throw error;
    }
};
