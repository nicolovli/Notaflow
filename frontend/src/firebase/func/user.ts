import {  doc, getDoc } from "firebase/firestore";
import { db } from "../../Config/firebase-config";

import { BasicUserInfo } from "../interfaces/interface.userInfo"; 

export const getAdditionalUserData = async (id: string): Promise<BasicUserInfo> => {
    try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          throw new Error(`User with ID ${id} not found`);
        }
        
        const userData = userSnap.data();
        
        return {
          id: userSnap.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username
        } as BasicUserInfo;
        
      } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
      }
};