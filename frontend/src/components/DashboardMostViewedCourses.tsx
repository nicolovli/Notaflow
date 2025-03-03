import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Pagination, Alert, Typography } from "@mui/material";
import Grid from "@mui/material/Grid"; 
import NoteCard from "../components/NoteCard";
import { getMostViewedNotes } from "../firebase/func/notes";
import { Note } from "../firebase/interfaces/interface.notes";

export const DashboardMostViewedNotes: React.FC = () => {

    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      const fetchSubjects = async () => {
        try {
          const notes = await getMostViewedNotes(9);
          setNotes(notes); 
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchSubjects();
    }, []);


  // Pagination state
  const [page, setPage] = useState(1);
  const coursesPerPage = 3;

  if(isLoading == false && notes.length > 0) { 
    // Calculate indices for slicing the sorted array
    const indexOfLastCourse = page * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentNotes = notes.slice(indexOfFirstCourse, indexOfLastCourse);

    // Calculate the total number of pages
    const totalPages = Math.ceil(notes.length / coursesPerPage);

    // Handle page changes
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
    };
    return (
      <Box sx={{ pt: 5, pr: 12, pb: 6, pl: 12}}>
          {/* Overskrift */}
      <Typography variant="h3" color="#19262d" sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
         Populære notater
      </Typography>
      <Typography variant="h6" color="textSecondary" sx={{ mb: 4, textAlign: "center" }}>
        Utforsk de mest populære notatene laget av studenter på NTNU
      </Typography>

 
        <Grid container spacing={3}>
          {currentNotes.map((note) => (
            <Grid item 
                xs={12}  // 1 card per row on extra-small screens
                sm={6}   // 2 cards per row on small screens
                md={4}   // 3 cards per row on medium+ screens and there will never be more than 3 cards per page
                lg={4} 
                key={note.id}>
              <NoteCard
                note={note}
                onDelete={(noteId) => setNotes(notes.filter((n) => n.id !== noteId))}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          />
        </Box>
      </Box>
    );
  } else if(isLoading == false && error){
    return (
      <Alert variant="filled" severity="error">
        Could not retrieve most viewed notes. Check you network connection
      </Alert>
    )
  }
  else {
    return (
      <div className="w-full h-full w flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }
  
};

export default DashboardMostViewedNotes;