import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import Grid from "@mui/material/Grid"; 
import { useParams, useLocation } from "react-router-dom";
import { getNotesBySubject } from "../firebase/func/notes";
import { Note } from "../firebase/interfaces/interface.notes";
import { Subject } from "../firebase/interfaces/interface.subject";
import NoteCard from "../components/NoteCard";

export const CourseDetailPage: React.FC = () => {
    const { id } = useParams(); 
    const location = useLocation();
    const course: Subject = location.state?.course;

    if( id !== course.id) {
        throw new Error("Invalid state");
    }
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      const fetchSubjects = async () => {
        try {
          if (id == undefined) { 
            setError("ID not set correctly");  
          }
          const notes = await getNotesBySubject((id ? id : ""));
          setNotes(notes);
          // sort
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchSubjects();
    }, [id]);
  

    if (isLoading) { 
        return (
            <div className="w-full h-full w flex justify-center items-center">
              <CircularProgress />
            </div>
        )
    } else if(error) {
        return <Alert variant="filled" severity="error">
                An error occured. Check you network connection
              </Alert>
    } else {
        return (
            <div>
              <Typography variant="h4"
                  sx={{
                    pt: 4,
                    textAlign: "center",
                    fontFamily: "Roboto, sans-serif",
                    mb: 4,
                  }}
                >
                  Her kan du finne notater i faget {course.name} ({course.subject_code})
              </Typography>
              <Box sx={{ pt: 5, pr: 12, pb: 3, pl: 12 }}>
                      <Grid container spacing={3}>
                        {notes.map((note) => (
                          <Grid item 
                              xs={12}  // 1 card per row
                              key={note.id}>
                            <NoteCard note={note} />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
            </div>
        );
    }
};

export default CourseDetailPage;
