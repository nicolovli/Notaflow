// src/pages/DashboardPage.tsx

import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Pagination, Alert } from "@mui/material";
import Grid from "@mui/material/Grid"; 
import CourseCard from "../components/CourseCard";
import { Subject } from "../firebase/interfaces/interface.subject";
import { getAllSubjects } from "../firebase/func/subject";

export const DashboardPage: React.FC = () => {

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      const fetchSubjects = async () => {
        try {
          const courses = await getAllSubjects();
          // sort
          const sortedCourses: Subject[] = [...courses].sort((a, b) => a.name.localeCompare(b.name));
          setSubjects(sortedCourses); 
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
  const coursesPerPage = 12;

  if(isLoading == false && subjects.length > 0) { 
    // Calculate indices for slicing the sorted array
    const indexOfLastCourse = page * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = subjects.slice(indexOfFirstCourse, indexOfLastCourse);

    // Calculate the total number of pages
    const totalPages = Math.ceil(subjects.length / coursesPerPage);

    // Handle page changes
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
    };
    return (
      <Box sx={{ pt: 10, pr: 12, pb: 3, pl: 12 }}>
        <Grid container spacing={3}>
          {currentCourses.map((course) => (
            <Grid item 
                xs={12}  // 1 card per row on extra-small screens
                sm={6}   // 2 cards per row on small screens
                md={4}   // 3 cards per row on medium+ screens and there will never be more than 3 cards per page
                lg={4} 
                key={course.id}>
              <CourseCard course={course} />
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
  } else if (isLoading == false && (subjects.length == 0 || error)) { 
    return (
      <Alert variant="filled" severity="error">
        An error occured. Check you network connection
      </Alert>
    )
  } else {
    return (
      <div className="w-full h-full w flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }
  
};

export default DashboardPage;