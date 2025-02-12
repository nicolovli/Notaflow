import { collection, addDoc } from "firebase/firestore";
import { db } from "../../Config/firebase-config";
import { AccessPolicyType, accessPolicyTypeToString, Note, CreateNoteInput } from "../interfaces/interface.notes";

export const createNote = async (input: CreateNoteInput): Promise<string> => {
  try {
    const noteData: Omit<Note, 'id'> = {
      user_id: input.user_id,
      subject_id: input.subject_id,
      title: input.title,
      content: input.content,
      date: new Date(),
      access_policy: {
        type: accessPolicyTypeToString(input.access_policy),
        ...((input.access_policy === AccessPolicyType.GROUP || input.access_policy === AccessPolicyType.PUBLIC) && {
          allowed_users: input.allowed_users || [],
          allowed_groups: input.allowed_groups || []
        })
      }
    };
    const noteRef = await addDoc(collection(db, "notes"), noteData);
    return noteRef.id;
    
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};