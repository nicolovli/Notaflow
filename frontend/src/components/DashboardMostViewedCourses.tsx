import React, { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import NoteCard from "../components/NoteCard";
import { getMostViewedNotes } from "../firebase/func/notes";
import { Note } from "../firebase/interfaces/interface.notes";

export const DashboardMostViewedNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const notes = await getMostViewedNotes(9);
        setNotes(notes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch subjects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!isLoading && scrollContainerRef.current) {
      handleScroll();
    }
  }, [isLoading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const atStart = scrollLeft === 0;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    // Bytter verdiene slik at fade forsvinner på den siden man er på
    scrollContainerRef.current.style.setProperty("--fade-left", atStart ? "1" : "0");
    scrollContainerRef.current.style.setProperty("--fade-right", atEnd ? "1" : "0");
  };

  if (isLoading == false && notes.length > 0) {
    return (
      <Box sx={{ pt: 5, pr: 12, pb: 6, pl: 12 }}>
        {/* Overskrift */}
        <Typography
          variant="h3"
          color="#19262d"
          sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
          Populære notater
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 4, textAlign: "center" }}>
          Utforsk de mest populære notatene laget av studenter på NTNU
        </Typography>

        <Box
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={{
            overflowX: "auto",
            maxWidth: "calc(100vw - 272px)",
            pb: 1,
            display: "flex",
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,var(--fade-left)) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,var(--fade-right)) 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,var(--fade-left)) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,var(--fade-right)) 100%)",
          }}>
          <Grid container spacing={3} sx={{ flexWrap: "nowrap" }}>
            {notes.map((note) => (
              <Grid
                item
                xs={12} // 1 card per row on extra-small screens
                sm={6} // 2 cards per row on small screens
                md={4} // 3 cards per row on medium+ screens and there will never be more than 3 cards per page
                lg={4}
                key={note.id}
                sx={{ flex: "0 0 auto" }} // Hindrer at kortene bryter til ny rad
              >
                <NoteCard
                  note={note}
                  onDelete={(noteId) => setNotes(notes.filter((n) => n.id !== noteId))}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}></Box>
        </Box>
      </Box>
    );
  } else if (isLoading == false && error) {
    return (
      <Alert variant="filled" severity="error">
        Could not retrieve most viewed notes. Check you network connection
      </Alert>
    );
  } else {
    return (
      <div className="w-full h-full w flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }
};

export default DashboardMostViewedNotes;
