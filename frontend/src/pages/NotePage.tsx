import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addNoteRating, getNote, hasUserRatedNote, incrementNoteViewCount } from "../firebase/func/notes";
import { Note, NoteRating } from "../firebase/interfaces/interface.notes";
import { getSubject } from "../firebase/func/subject";
import { Subject } from "../firebase/interfaces/interface.subject";
import { CircularProgress, Alert, Tooltip, Typography, Chip, Rating, Box } from "@mui/material";
import { addFavorite, removeFavorite, isFavorite } from "../firebase/func/favorites";
import { getAverageRating } from "../firebase/func/notes";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from '@mui/icons-material/Star';
import RatingPopup from "../components/FloatingRatingBox";
import "../assets/style.css";
import { auth } from "../Config/firebase-config";

export const NotePage: React.FC = () => {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [isNoteFavorite, setIsNoteFavorite] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [hasUserRated, setHasUserRated] = useState<boolean>(true);


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
          setAverageRating(getAverageRating(_note.note_ratings));
          const subject = await getSubject(_note.subject_id);
          setSubject(subject);

      
          const _uid = auth.currentUser?.uid; 
          if(!_uid) { 
            setUid(null)
            return  
          }
          setUid(_uid);
          setHasUserRated(hasUserRatedNote(_uid, _note.note_ratings));
          
          const _notefav: boolean = await isFavorite(_uid, _note.id);
          setIsNoteFavorite(_notefav);

          incrementNoteViewCount(id); // increment because user can now view page
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch subjects");
      } finally {
        setIsLoading(false);
      }
   
    };
    fetchAll();

  }, [id]);

  const handleToggleFavorite = () => {
    if (!uid || !note) return;
    if (isNoteFavorite) removeFavorite(uid, note.id);
    else addFavorite(uid, note.id);
    setIsNoteFavorite(!isNoteFavorite);
  };

  const handleSaveRating = async (newRating: number) => {
    if(!note || !auth.currentUser || hasUserRated) 
      throw new Error("Not logged in, no note or user has already rated note");

    const noteRating: NoteRating = {
      rating: newRating,
      rated_by_uid: auth.currentUser.uid,
      date: new Date()
    };

    await addNoteRating(note.id, noteRating);
    setHasUserRated(true);
    note.note_ratings.push(noteRating)
    setAverageRating(getAverageRating(note.note_ratings));
    setRatingOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  } else if (error || note == null || subject == null) {
    return (
      <Alert variant="filled" severity="error">
        An error occurred. Check your network connection
      </Alert>
    );
  } else {
    return (
      <div 
      className="relative flex justify-start items-center place-items-center flex-col">
           {/* Everything on right side */}
    <div className="flex flex-col gap-4 mt-6 mb-4 relative max-w-3xl w-full p-20 h-full font-sans top-2" 
      style={{
        paddingBottom: 20,
        marginBottom: 20
      }}
    >
      <div className="flex items-center justify-center gap-4 0">
      {uid ? (
          <Tooltip title={isNoteFavorite ? "Remove from favorites" : "Add to favorites"}>
          <Chip
            icon={isNoteFavorite ? <FavoriteIcon style={{ color: 'red' }} /> : <FavoriteBorderIcon />}
            label={isNoteFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={handleToggleFavorite}
            variant="outlined"
            sx={{
              borderRadius: '20px',
              color: isNoteFavorite ? 'red' : 'gray',
              borderColor: isNoteFavorite ? 'red' : 'gray',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 0.04)',
                cursor: 'pointer'
              },
              padding: '0 8px',
              height: '36px',
              backgroundColor: 'white',
              boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
            }}
            aria-label={isNoteFavorite ? "remove from favorites" : "add to favorites"}
          />
        </Tooltip>
        ): null}

        <Chip
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, ml: -1 }}>
              <Rating 
                value={averageRating} 
                precision={0.5} 
                readOnly 
                size="small"
                sx={{ 
                  fontSize: '0.85rem',
                  mr: -0.5,
                  marginLeft: 1
                }} 
              />
                <Typography 
              sx={{
                marginLeft: 0.5,
                marginTop: 0.5
              }}
              variant="body2">Rating: {averageRating.toFixed(1)}</Typography>
            </Box>
          }
          variant="outlined"
          sx={{
            borderRadius: '20px',
            color: 'gray',
            backgroundColor: 'white',
            borderColor: 'gray',
            padding: '0 8px',
            height: '36px',
            cursor: 'default',
            '& .MuiChip-label': {
              display: 'flex',
              padding: '0 8px 0 4px'
            },
            boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
          }}
          aria-label={`Average rating is ${averageRating.toFixed(1)} stars`}
        />

        {uid && uid != note.user_id && !hasUserRated? (
        <Tooltip title="Rate note">
          <Chip
            icon={<StarIcon style={{ color: 'gold' }} />}
            label="Rate note"
            onClick={() => setRatingOpen(true)}
            variant="outlined"
            sx={{
              borderRadius: '20px',
              color: 'gray',
              borderColor: 'gray',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.04)',
                cursor: 'pointer'
              },
              padding: '0 8px',
              height: '36px',
              backgroundColor: 'white',
              boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
            }}
            aria-label="rate note"
          />
        </Tooltip>
        ): null}
    </div>

      {/* RatingPopup */}
      <RatingPopup open={ratingOpen} onClose={() => setRatingOpen(false)} onSave={handleSaveRating} noteTitle={note.title} />
    </div>
      <div
        style={{
          marginLeft: 20,
          marginRight: 20,
          marginBottom: 20,
          boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
          borderRadius: 20
        }}
       className="relative max-w-3xl w-full p-20 h-full font-sans bg-white overflow-hidden">
        <div 
        style={{
          padding: 30,
          minHeight: 'calc(100vh - 200px)'
        }}
        className="p-10 w-full h-full">
        
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



