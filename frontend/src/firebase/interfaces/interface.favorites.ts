import { Timestamp } from "firebase/firestore";

export interface Favorite {
    noteId: string;
    addedAt: Date; 
}
export interface FavoriteFB {
    noteId: string;
    addedAt: Timestamp; 
}
  