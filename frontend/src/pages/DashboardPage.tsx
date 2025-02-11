// src/pages/DashboardPage.tsx

import React, { useState} from "react";
import { Box, Pagination } from "@mui/material";
import Grid from "@mui/material/Grid"; 
import CourseCard from "../components/CourseCard";

interface Course {
  id: string;
  name: string;         // e.g. "Statistikk"
  code: string;         // e.g. "ISTT1003"
  description: string;
}

export const DashboardPage: React.FC = () => {
  const courses: Course[] = [
    { id: "algdat", name: "Algoritmer og Datastrukturer", code: "TDT4120", description: "Analyse og design av algoritmer..." },
    { id: "datamaskiner", name: "Datamaskiner", code: "TDT4160", description: "Introduksjon til datamaskinarkitektur..." },
    { id: "diskret", name: "Elementær diskret matematikk", code: "MA0301", description: "Grunnleggende diskret matematikk..." },
    { id: "etisk-hacking", name: "Etisk hacking", code: "IIK3100", description: "Sikkerhetsrelaterte teknikker og verktøy..." },
    { id: "prosjektarbeid", name: "Informatikk prosjektarbeid", code: "IT1901", description: "Praktisk prosjektarbeid i informatikk..." },
    { id: "itgk", name: "Informasjonsteknologi, grunnkurs", code: "TDT4110", description: "Grunnleggende programmering og datateknikk..." },
    { id: "matte1", name: "Matematikk 1", code: "TMA4100", description: "Envariabel analyse, integrasjon, derivasjon..." },
    { id: "mmi", name: "Menneske-maskin-interaksjon", code: "TDT4180", description: "Design og evaluering av brukergrensesnitt..." },
    { id: "oop", name: "Objektorientert programmering", code: "TDT4100", description: "Klasser, arv, designmønstre..." },
    { id: "statistikk", name: "Statistikk", code: "ISTT1003", description: "Beskrivende statistikk, sannsynlighet..." },
    { id: "ktn", name: "Kommunikasjon - Tjenester og nett", code: "TTM4100", description: "Nettverkskommunikasjon, protokoller..." },
    { id: "webtek", name: "Webteknologi", code: "IT2805", description: "Klient- og serverbasert webutvikling..." } ,
    { id: "fluidmekanikk", name: "Fluidmekanikk", code: "TEP4100", description: "...." },
    { id: "komm-tjenester", name: "Fysikk", code: "TFY4115", description: "..." },
    { id: "matte2", name: "Matematikk 2", code: "TMA4105", description: "" },
    { id: "matte3", name: "Matematikk 3", code: "TMA4115", description: "" },
    { id: "matte4", name: "Matematikk 4", code: "TMA4130", description: "" }
  ];

  // Sort courses alphabetically by name
  const sortedCourses = [...courses].sort((a, b) => a.name.localeCompare(b.name));

  // Pagination state
  const [page, setPage] = useState(1);
  const coursesPerPage = 12;

  // Calculate indices for slicing the sorted array
  const indexOfLastCourse = page * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Calculate the total number of pages
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);

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
};

export default DashboardPage;