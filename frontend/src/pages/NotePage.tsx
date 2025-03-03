import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNote } from "../firebase/func/notes";
import { Note } from "../firebase/interfaces/interface.notes";
import { getSubject } from "../firebase/func/subject";
import { Subject } from "../firebase/interfaces/interface.subject";
import { CircularProgress, Alert, IconButton, Tooltip } from "@mui/material";
import { addFavorite, removeFavorite, isFavorite } from "../firebase/func/favorites";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import "../assets/style.css";
import { auth } from "../Config/firebase-config";

export const NotePage: React.FC = () => {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setisLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [isNoteFavorite, setIsNoteFavorite] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (id == undefined) {
          throw new Error("ID not set correctly");
        } else {
          const _note = await getNote(id);
          setNote(_note);
          if(_note == null) {
            throw new Error("Error with note");
          }
          const subject = await getSubject(_note.subject_id);
          setSubject(subject);

      
          const _uid = auth.currentUser?.uid; 
          if(!_uid) { 
            setUid(null)
            return  
          }
          setUid(_uid);
          
          const _notefav: boolean = await isFavorite(_uid, _note.id);
          setIsNoteFavorite(_notefav);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      } finally {
        setisLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleToggleFavorite = () => {
    if(!uid || !note) 
      return

    if (isNoteFavorite)
      removeFavorite(uid, note.id);
    else 
      addFavorite(uid, note.id)
    
    setIsNoteFavorite(!isNoteFavorite);

    // In a real app, you'd update the database here
  };

  if (isLoading) {
    return (
      <div className="w-full h-full w flex justify-center items-center">
                          <CircularProgress />
                      </div>
    );
  } else if(error || note == null || subject == null) {
    return (
      <Alert variant="filled" severity="error">
        An error occured. Check you network connection
      </Alert>
    );
  } else {
    return (
      <div 
      className="relative flex justify-center items-start place-items-center">
      <div
        style={{
          marginLeft: 20,
          marginRight: 20,
          marginBottom: 20,
          boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
          borderRadius: 20
        }}
       className="relative max-w-3xl w-full p-20 h-full font-sans top-2 bg-white">
        <div 
        style={{
          padding: 30,
          minHeight: 'calc(100vh - 120px)'
        }}
        className="p-10 w-full h-full">
        {uid ? (
            <Tooltip title={isNoteFavorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton 
              onClick={handleToggleFavorite}
              sx={{ 
                position: 'absolute', 
                top: '16px', 
                right: '16px',
                color: isNoteFavorite ? 'red' : 'gray',
                fontSize: 40
              }}
              aria-label={isNoteFavorite ? "remove from favorites" : "add to favorites"}
            >
              {isNoteFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
        ): null}
        
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{note.title}</h1>
        <p 
          style={{
            paddingBottom: 20,
            marginBottom: 20

          }}
          className="text-lg text-gray-700 font-medium border-b-gray-200 border-b mb-4">
          {subject.name} ({subject.subject_code})
        </p>

        <div
          id="content"
          className="prose prose-lg text-gray-800 leading-relaxed mt-6"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
        </div>
      </div>
    </div>
  );
  }
};

export default NotePage;