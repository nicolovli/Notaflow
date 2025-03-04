import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  increment,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../../Config/firebase-config";
import {
  AccessPolicyType,
  accessPolicyTypeToString,
  Note,
  CreateNoteInput,
  NoteRating,
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
      note_ratings: [],
      view_counter: 0
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
        note_ratings: data.note_ratings || []
      };
    }) as Note[];
    return notes;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
};

export const getNote = async (noteId: string): Promise<Note> => {
  try {
    const noteRef = doc(db, "notes", noteId);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) {
      throw new Error(`Subject with ID ${noteId} not found`);
    }
    const data = noteSnap.data();
    return {
      id: noteSnap.id,
      ...data,
      date: data.date?.toDate(),
      note_ratings: data.note_ratings || []
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
        date: data.date?.toDate(),
        note_ratings: data.note_ratings || []
      };
    }) as Note[];
    return notes;
  } catch (error) {
    console.error("Error fetching user notes:", error);
    throw error;
  }
};

export const deleteNote = async (note_id: string): Promise<void> => {
  try {
    const noteRef = doc(db, "notes", note_id);
    await deleteDoc(noteRef);

    const userRef = collection(db, "users");
    const usersSnapshot = await getDocs(userRef);

    const batchUpdates = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      if (userData.favorites) {
        const updatedFavorites = userData.favorites.filter(
          (fav: { noteId: string }) => fav.noteId !== note_id
        );
        await updateDoc(userDoc.ref, { favorites: updatedFavorites });
      }
    });

    await Promise.all(batchUpdates);

    console.log(`Note with ID ${note_id} has been successfully deleted.`); //fjern eventuelt
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

export const addNoteRating = async (note_id: string, note_rating: NoteRating): Promise<void> => {
  try {
    const noteRef = doc(db, "notes", note_id);

    await updateDoc(noteRef, {
      note_ratings: arrayUnion(note_rating)
    });

  } catch (error) {
     console.error("Error adding rating:", error);
    throw error;
  }
}

export const hasUserRatedNote = (user_id: string, note_ratings: NoteRating[]): boolean => {
  return note_ratings.map(n => n.rated_by_uid).includes(user_id);
}

export const getAverageRating = (note_ratings: NoteRating[]): number => {
  if (note_ratings.length == 0)
    return 0
  return note_ratings.reduce((acc, current) => acc+current.rating, 0) / note_ratings.length;
}

export const incrementNoteViewCount = async (note_id: string): Promise<void> => {
  try {
    const noteRef = doc(db, "notes", note_id);

    await updateDoc(noteRef, {
      view_counter: increment(1)
    });
  } catch (error) {
    console.log("Error while incrementing note view count", error);
    throw error;
  }
}

export const getMostViewedNotes = async (i: number): Promise<Note[]> => {
  try {
    const notesRef = collection(db, "notes");
    // Create a query for public notes, ordered by view_counter in descending order
    const q = query(
      notesRef,
      where("access_policy.type", "==", "public"),
      orderBy("view_counter", "desc"),
      limit(i)
    );
    
    const querySnapshot = await getDocs(q);
    const notes: Note[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate(),
      } as Note);
    });

    return notes;
    
  } catch (error) {
    console.error(`Failed to retrive the ${i} most viewed public notes`, error);
    throw error; 
  }
}