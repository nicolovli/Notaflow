import {  collection, doc, getDoc, getDocs } from "firebase/firestore";
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
          username: userData.username,
          isAdmin: userData.isAdmin
        } as BasicUserInfo;
        
      } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
      }
};

export const getAllUsers = async (): Promise<BasicUserInfo[]> => { 
    try {
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const usersInfo: BasicUserInfo[] = usersSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id
        } as BasicUserInfo
      })
      return usersInfo;
    } catch (error) {
      console.error("Failed to fetch all users: ", error);
      throw error; 
    }
}