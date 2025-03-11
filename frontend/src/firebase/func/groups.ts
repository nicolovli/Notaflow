import { collection, addDoc, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../Config/firebase-config";
import { Group, SharedNote } from "../interfaces/interface.groups";
import { giveGroupAccessToNote } from "./notes";

export const createGroup = async (members: string[]): Promise<string> => {
    try {
        const group: Omit<Group, "id"> = {
            members: members,
            createdAt: new Date(),
            shared_notes: []
        }
        const groupRef = await addDoc(collection(db, "groups"), group);
        return groupRef.id;
    } catch (error) {
        console.error("Error creating group: ", error);
        throw error;
    }
}

export const isUserMemberOfGroup = async (group_id: string, user_id: string): Promise<boolean> => {
    try {
        const groupRef = doc(db, "groups", group_id);
        const groupSnap = await getDoc(groupRef);
        
        if (!groupSnap.exists()) {
          console.log("Group does not exist");
          return false;
        }
        
        const groupData = groupSnap.data() as Group;
        return groupData.members.includes(user_id);
        
      } catch (error) {
        console.error("Error checking group membership: ", error);
        throw error;
      }
}

export const shareNote = async (note_id: string, group_id: string, user_id: string) => {
    try {
        const isMember = await isUserMemberOfGroup(group_id, user_id);
    
        if (!isMember) 
          throw new Error("User is not a member of this group");
        
        const shared_note: SharedNote = {
            shared_by: user_id,
            note_id: note_id,
            date: new Date()
        };

        const groupRef = doc(db, "groups", group_id);
    
        await updateDoc(groupRef, {
          shared_notes: arrayUnion(shared_note)
        });

      await giveGroupAccessToNote(note_id, group_id);

    } catch (error) {
        console.error(error); 
        throw error; 
    }
}