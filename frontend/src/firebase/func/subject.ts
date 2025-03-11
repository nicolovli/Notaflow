import { collection, addDoc, doc, getDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../Config/firebase-config";
import { CreateSubject, Subject } from "../interfaces/interface.subject";

export const createSubject = async (input: CreateSubject): Promise<string> => {
  try {
    const subjectData: Omit<Subject, "id"> = {
      ...input,
    };
    const subjectRef = await addDoc(collection(db, "subjects"), subjectData);
    return subjectRef.id;
  } catch (error) {
    console.error("Error creating subject:", error);
    throw error;
  }
};

export const getSubject = async (id: string): Promise<Subject> => {
  try {
    const subjectRef = doc(db, "subjects", id);
    const subjectSnap = await getDoc(subjectRef);

    if (!subjectSnap.exists()) {
      throw new Error(`Subject with ID ${id} not found`);
    }

    return {
      id: subjectSnap.id,
      ...subjectSnap.data(),
    } as Subject;
  } catch (error) {
    console.error("Error fetching subject:", error);
    throw error;
  }
};

export const getAllSubjects = async (): Promise<Subject[]> => {
  try {
    const subjectsRef = collection(db, "subjects");
    const querySnapshot = await getDocs(subjectsRef);

    const subjects: Subject[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subject[];

    return subjects;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
  try {
    const subjectRef = doc(db, "subjects", subjectId);
    const subjectSnap = await getDoc(subjectRef);

    if (!subjectSnap.exists()) {
      throw new Error(`Subject with ID ${subjectId} not found`);
    }

    await deleteDoc(subjectRef);
    console.log(`Subject with ID ${subjectId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting subject:", error);
    throw error;
  }
};

export const updateSubject = async (
  subjectId: string,
  updatedData: Partial<CreateSubject>
): Promise<void> => {
  try {
    const subjectRef = doc(db, "subjects", subjectId);
    const subjectSnap = await getDoc(subjectRef);

    if (!subjectSnap.exists()) {
      throw new Error(`Subject with ID ${subjectId} not found`);
    }

    await updateDoc(subjectRef, updatedData);
    console.log(`Subject with ID ${subjectId} updated successfully`);
  } catch (error) {
    console.error("Error updating subject:", error);
    throw error;
  }
};
