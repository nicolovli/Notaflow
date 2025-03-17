import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../Config/firebase-config";
import { Group, SharedNote } from "../interfaces/interface.groups";
import { giveGroupAccessToNote } from "./notes";
import { Note } from "../interfaces/interface.notes";

export const getUserGroups = async (user_id: string): Promise<Group[]> => {
  try {
    const groupsRef = collection(db, "groups");

    const q = query(groupsRef, where("members", "array-contains", user_id));
    const querySnapshot = await getDocs(q);

    const groups: Group[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        members: data.members || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        shared_notes: data.shared_notes || [],
      } as Group;
    });

    return groups;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    throw error;
  }
};

export const createGroup = async (group_name: string, members: string[]): Promise<string> => {
  try {
    const group: Omit<Group, "id"> = {
      name: group_name,
      members: members,
      createdAt: new Date(),
      shared_notes: [],
    };
    const groupRef = await addDoc(collection(db, "groups"), group);
    return groupRef.id;
  } catch (error) {
    console.error("Error creating group: ", error);
    throw error;
  }
};

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
};

export const isUserMemberOfOneGroup = async (groups: string[], user_id: string) => {
  for (let i = 0; i < groups.length; i++) {
    if (await isUserMemberOfGroup(groups[i], user_id)) return true;
  }
  return false;
};

export const shareNote = async (note_id: string, group_id: string, user_id: string) => {
  try {
    const isMember = await isUserMemberOfGroup(group_id, user_id);

    if (!isMember) throw new Error("User is not a member of this group");

    const shared_note: SharedNote = {
      shared_by: user_id,
      note_id: note_id,
      date: new Date(),
    };

    const groupRef = doc(db, "groups", group_id);

    await updateDoc(groupRef, {
      shared_notes: arrayUnion(shared_note),
    });

    await giveGroupAccessToNote(note_id, group_id);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getGroupNotes = async (group_id: string): Promise<Note[]> => {
  try {
    const groupRef = doc(db, "groups", group_id);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      console.log("Group does not exist");
      return [];
    }

    const groupData = groupSnap.data() as Group;
    const sharedNotes: SharedNote[] = groupData.shared_notes || [];

    if (sharedNotes.length === 0) {
      return [];
    }

    // Hent alle notater parallelt for å forbedre ytelsen
    const notePromises = sharedNotes.map(async (sharedNote) => {
      try {
        const noteRef = doc(db, "notes", sharedNote.note_id);
        const noteSnap = await getDoc(noteRef);
        if (noteSnap.exists()) {
          return { id: noteSnap.id, ...noteSnap.data() } as Note;
        }
      } catch (error) {
        console.error(`Error fetching note with ID ${sharedNote.note_id}:`, error);
      }
      return null; // Returner null hvis notatet ikke finnes
    });

    const allNotes = (await Promise.all(notePromises)).filter((note) => note !== null) as Note[];

    return allNotes;
  } catch (error) {
    console.error("Error fetching group notes: ", error);
    throw error;
  }
};
