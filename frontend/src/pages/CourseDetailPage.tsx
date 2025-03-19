import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useParams } from "react-router-dom";
import { getNotesBySubject } from "../firebase/func/notes";
import { AccessPolicyType, Note, stringToAccessPolicyType } from "../firebase/interfaces/interface.notes";
import { Subject } from "../firebase/interfaces/interface.subject";
import NoteCard from "../components/NoteCard";
import { getSubject } from "../firebase/func/subject";
import SearchBar from "../components/SearchBar";
import FilterBox from "../components/FilterBox";
import { getAllCategory } from "../firebase/func/category";
import { Category } from "../firebase/interfaces/interface.category";

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams();
  // const location = useLocation();
  // const course: Subject = location.state?.course;
  const [course, setCourse] = useState<Subject | null>(null);

  // if( id !== course.id) {
  //     throw new Error("Invalid state");
  // }
  const [notes, setNotes] = useState<Note[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        if (id == undefined) { 
          setError("ID not set correctly");  
        }
        const courseData = await getSubject((id ? id : ""));  
        setCourse(courseData);
        const _notesData = await getNotesBySubject((id ? id : ""));
        const notesData = _notesData.filter(f => stringToAccessPolicyType(f.access_policy.type) == AccessPolicyType.PUBLIC);
        setNotes(notesData);
        setFilteredNotes(notesData);
        const categoriesData = await getAllCategory();
        setCategories(categoriesData);
        // sort
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [id]);


  const handleSearch = (filtered: Note[], term: string) => {
    setSearchTerm(term);
    applyFilters(filtered, selectedTags, selectedThemes);
  };

  const handleFilter = (tags: string[], themes: string[]) => {
    setSelectedTags(tags);
    setSelectedThemes(themes);
    applyFilters(notes, tags, themes);
  };
  
  const handleReset = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedThemes([]);
    setFilteredNotes(notes);
  }; 

  const applyFilters = (notesToFilter: Note[], tags: string[], themes: string[]) => {
    const filteredThemes = themes.filter(theme => theme !== "");
    
    const filtered = notesToFilter.filter((note) => {
      const noteTags = note.tag || [];
      const noteTagNames = noteTags.map(tag => tag.includes(':') ? tag.split(':')[1] : tag);
      
      const matchesTags = tags.length === 0 || tags.some((tagName) => noteTagNames.includes(tagName));
      const matchesThemes = filteredThemes.length === 0 || filteredThemes.some((theme) => note.theme.includes(theme));
      const matchesSearch = searchTerm === "" || note.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesTags && matchesThemes && matchesSearch;
    });
    
    setFilteredNotes(filtered);
  };

  const tags = useMemo(() => {
    return Array.from(
      new Set(
        notes.flatMap((note) => {
          const noteTags = Array.isArray(note.tag) ? note.tag : [];
          return noteTags;
        })
      )
    );
  }, [notes]);
  
  const themes = useMemo(() => {
    return Array.from(
        new Set(
            notes.flatMap((note) => {
                const noteThemes = Array.isArray(note.theme) ? note.theme : [];
                return noteThemes;
            })
        )
    );
}, [notes]);  
  
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
  } else if(!course){
    return(
      <Alert variant="filled" severity="warning">
        Course not found
      </Alert>
    )
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
            <Typography variant="h6" color="textSecondary" sx={{ mb: 4, textAlign: "center" }}>
              <p>Finner du ikke notaten du leste i går?</p>
              <p>Frykt ikke! Søk etter tittelen på notatet!</p>
            </Typography>
            <Box sx={{ mb: 5, textAlign: "center" }}>
              <SearchBar<Note>
              data = {notes}
              onSearch={(filtered, term) => handleSearch(filtered, term)}
              filterFunction={(note, term) => 
              note.title.toLowerCase().includes(term.toLowerCase())}
              placeholder="Søk etter tittel"
              />
            </Box>
            <Box sx={{ mb: 5, textAlign: "center" }}>
              <FilterBox
                tags={tags}
                themes={themes}
                onFilter={handleFilter}
                onReset={handleReset}
              />
            </Box>
            <Box sx={{ pt: 5, pr: 12, pb: 3, pl: 12 }}>
              {filteredNotes.length === 0 && searchTerm !== "" ? (
                <Alert variant="filled" severity="info" sx={{mb:3}}>
                  Ingen notater funnet med tittelen "{searchTerm}". Prøv et annet søkeord.
                </Alert>
              ) : null}
              <Grid container spacing={3}>
                {filteredNotes.map((note) => (
                  <Grid
                    item
                    xs={12} // 1 card per row on extra-small screens
                    sm={6} // 2 cards per row on small screens
                    md={4} // 3 cards per row on medium+ screens and there will never be more than 3 cards per page
                    lg={4}
                    key={course.id}>
                    <NoteCard note={note}/>
                  </Grid>
                  
                ))}
              </Grid>
            </Box>
          </div>
      );
  }
}