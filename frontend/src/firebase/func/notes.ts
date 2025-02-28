import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../Config/firebase-config";
import {
  AccessPolicyType,
  accessPolicyTypeToString,
  Note,
  CreateNoteInput,
} from "../interfaces/interface.notes";

export const createNote = async (input: CreateNoteInput): Promise<string> => {
  try {
    const noteData: Omit<Note, "id"> = {
      user_id: input.user_id,
      subject_id: input.subject_id,
      title: input.title,
      content: input.content,
      date: new Date(),
      access_policy: {
        type: accessPolicyTypeToString(input.access_policy),
        ...((input.access_policy === AccessPolicyType.GROUP ||
          input.access_policy === AccessPolicyType.PUBLIC) && {
          allowed_users: input.allowed_users || [],
          allowed_groups: input.allowed_groups || [],
        }),
      },
    };
    const noteRef = await addDoc(collection(db, "notes"), noteData);
    return noteRef.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const getNotesBySubject = async (subject_id: string): Promise<Note[]> => {
  try {
    const notesRef = collection(db, "notes");
    const q = query(notesRef, where("subject_id", "==", subject_id));
    const querySnapshot = await getDocs(q);
    const notes: Note[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate(), // Convert Timestamp to Date
      };
    }) as Note[];
    return notes;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
};

export const getNote = async (id: string): Promise<Note> => {
  try {
    const noteRef = doc(db, "notes", id);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) {
      throw new Error(`Subject with ID ${id} not found`);
    }
    const data = noteSnap.data();
    return {
      id: noteSnap.id,
      ...data,
      date: data.date?.toDate(), // Convert Timestamp to Date
    } as Note;
  } catch (error) {
    console.error("Error fetching subject:", error);
    throw error;
  }
};

export const getUserNotes = async (user_id: string): Promise<Note[]> => {
  try {
    const notesRef = collection(db, "notes");
    const q = query(notesRef, where("user_id", "==", user_id));
    const querySnapshot = await getDocs(q);
    const notes: Note[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate(), // Convert Timestamp to Date
      };
    }) as Note[];
    return notes;
  } catch (error) {
    console.error("Error fetching user notes:", error);
    throw error;
  }
};
