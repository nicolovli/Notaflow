import { collection, addDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../Config/firebase-config";
import { CreateCategory, Category } from "../interfaces/interface.category";

export const createCategory = async (input: CreateCategory): Promise<string> => {
  try {
    const categoryData: Omit<Category, "id"> = {
      ...input,
    };
    const categoryRef = await addDoc(collection(db, "category"), categoryData);
    return categoryRef.id;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const getCategory = async (id: string): Promise<Category> => {
  try {
    const categoryRef = doc(db, "category", id);
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
      throw new Error(`Category with ID ${id} not found`);
    }

    return {
      id: categorySnap.id,
      ...categorySnap.data(),
    } as Category;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};

export const getAllCategory = async (): Promise<Category[]> => {
  try {
    const categoryRef = collection(db, "category");
    const querySnapshot = await getDocs(categoryRef);

    const category: Category[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];

    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};

export const updateCategory = async (
  tag: string,
  updatedData: Partial<CreateCategory>
): Promise<void> => {
  try {
    const categoryRef = doc(db, "category");
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
      throw new Error(`Category with not found`);
    }

    await updateDoc(categoryRef, updatedData);
    console.log(`Category with tag ${tag} updated successfully`);
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};
