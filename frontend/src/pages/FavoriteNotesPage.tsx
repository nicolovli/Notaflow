import React, { useState, useEffect } from "react";
import { Box, Typography, Pagination, Grid, Alert, CircularProgress } from "@mui/material";
import NoteCard from "../components/NoteCard";
import { Note } from "../firebase/interfaces/interface.notes";
import { auth } from "../Config/firebase-config";
import { useNavigate } from "react-router-dom";
import { getFavorteNotes } from "../firebase/func/favorites";

export const FavoriteNotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const notesPerPage = 12;

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        if (!auth.currentUser) {
          navigate("/login");
          return;
        }

        const favorites: Note[] = await getFavorteNotes(auth.currentUser.uid);

        setNotes(favorites);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch favorite notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="w-full h-full w flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  } else if (error) {
    return (
      <Alert variant="filled" severity="error">
        An error occurred. Check your network connection.
      </Alert>
    );
  } else if (notes.length < 1) {
    return (
      <Alert severity="info">
        Du har ikke favoritisert noen notater enda. Favoritiserte notater vil vises her.
      </Alert>
    );
  }

  const indexOfLastNote = page * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = notes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(notes.length / notesPerPage);

  return (
    //Page title
    <div>
      <Typography
        variant="h4"
        sx={{ pt: 4, textAlign: "center", fontFamily: "Roboto, sans-serif", mb: 4 }}>
        Favoritt Notater
      </Typography>

      <Box sx={{ pt: 5, pr: 12, pb: 3, pl: 12 }}>
        <Grid container spacing={3}>
          {currentNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={note.id}>
              <NoteCard
                note={note}
                onDelete={(noteId) => setNotes(notes.filter((n) => n.id !== noteId))}
              />
            </Grid>
          ))}
        </Grid>
        {/* Pagination controls */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
        </Box>
      </Box>
    </div>
  );
};

export default FavoriteNotesPage;
