import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../Config/firebase-config";
import { Favorite, FavoriteFB } from "../interfaces/interface.favorites";
import { Note } from "../interfaces/interface.notes";
import { getNote } from "./notes";

export const addFavorite = async (userId: string, noteId: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    const newFavorite: Favorite = {
      noteId,
      addedAt: new Date() 
    };
    
    await updateDoc(userRef, {
      favorites: arrayUnion(newFavorite) // adds element to array 
    });
    
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

export const removeFavorite = async (userId: string, noteId: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const userData = userSnap.data();
    const currentFavorites = userData.favorites || [];
    
    const updatedFavorites = currentFavorites.filter(
      (fav: Favorite) => fav.noteId !== noteId
    );
    
    await updateDoc(userRef, {
      favorites: updatedFavorites
    });
    
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

export const getUserFavorites = async (userId: string): Promise<Favorite[]> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const userData = userSnap.data();
    const favorites: FavoriteFB[] = userData.favorites || [];
    return favorites.map(favorite => ({
      ...favorite,
      addedAt: favorite.addedAt.toDate() // Convert Firestore Timestamp to JS Date
    }));

  } catch (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }
};

export const getUserFavoritesInOrder = async (userId: string): Promise<Favorite[]> => {
  try {
    const favorites = await getUserFavorites(userId);
    return favorites.sort((a: Favorite, b: Favorite) => {
      return b.addedAt.getTime() - a.addedAt.getTime();
    });
    
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }
};

export const FavoriteListToStringList = (list: Favorite[]): string[] => {
    return list.map(i => i.noteId);
}

export const isFavorite = async (userId: string, noteId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const userData = userSnap.data();
    const currentFavorites = userData.favorites || [];
    return FavoriteListToStringList(currentFavorites).includes(noteId);
    
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

export const getFavorteNotes = async (userId: string): Promise<Note[]> => { 
  try {
    const fav = await getUserFavoritesInOrder(userId);
    const favNotes: Note[] = await Promise.all(fav.map(async f => await getNote(f.noteId)));
    return favNotes;
  } catch (error) {
    console.error("Error fetching favorite notes:", error);
    throw error;
  }
} 