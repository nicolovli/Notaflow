import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Pagination, Alert, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";
import { Subject } from "../firebase/interfaces/interface.subject";
import { getAllSubjects } from "../firebase/func/subject";

export const DashboardAllCourses: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const coursesPerPage = 12;

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const courses = await getAllSubjects();
        // sort
        const sortedCourses: Subject[] = [...courses].sort((a, b) => a.name.localeCompare(b.name));
        setSubjects(sortedCourses);
        setFilteredSubjects(sortedCourses);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch subjects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleDelete = (deletedCourseId: string) => {
    setSubjects((prev) => prev.filter((course) => course.id !== deletedCourseId));
    setFilteredSubjects((prev) => prev.filter((course) => course.id !== deletedCourseId));
  };

  //handle search term changes
  const handleSearch = (filteredSubjects: Subject[], term: string) => {
    setFilteredSubjects(filteredSubjects);
    if (term !== searchTerm) {
      setPage(1);
    }
    setSearchTerm(term);
  };

  if (isLoading == false && filteredSubjects.length > 0) {
    // Calculate indices for slicing the sorted array
    const indexOfLastCourse = page * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredSubjects.slice(indexOfFirstCourse, indexOfLastCourse);

    // Calculate the total number of pages
    const totalPages = Math.ceil(filteredSubjects.length / coursesPerPage);

    // Handle page changes
    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
    };
    return (
      <Box sx={{ pt: 5, pr: 12, pb: 3, pl: 12 }}>
        {/* Overskrift */}
        <Typography
          variant="h3"
          color="#19262d"
          sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
          Tilgjengelige fag
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 4, textAlign: "center" }}>
          Utforsk notater delt av engasjerte studenter på NTNU
        </Typography>

        {/* Søkebar */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <SearchBar
            subjects={subjects}
            onSearch={(filtered: Subject[], term: string) => handleSearch(filtered, term)}
          />
        </Box>
        <Grid container spacing={3}>
          {currentCourses.map((course) => (
            <Grid
              item
              xs={12} // 1 card per row on extra-small screens
              sm={6} // 2 cards per row on small screens
              md={4} // 3 cards per row on medium+ screens and there will never be more than 3 cards per page
              lg={4}
              key={course.id}>
              <CourseCard course={course} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Box>
      </Box>
    );
  } else if (isLoading == false && filteredSubjects.length == 0) {
    return (
      <Box sx={{ pt: 5, pr: 12, pb: 3, pl: 12 }}>
        {/* Overskrift */}
        <Typography
          variant="h3"
          color="#19262d"
          sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
          Tilgjengelige fag
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 4, textAlign: "center" }}>
          Utforsk alle notater delt av engasjerte studenter på NTNU
        </Typography>
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <SearchBar
            subjects={subjects}
            onSearch={(filtered: Subject[], term: string) => handleSearch(filtered, term)}
          />
        </Box>
        <Alert variant="filled" severity="info">
          Dette faget er dessverre ikke tilgjengelig.
        </Alert>
      </Box>
    );
  } else if (isLoading == false && error) {
    return (
      <Alert variant="filled" severity="error">
        An error occured. Check you network connection
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

export default DashboardAllCourses;
