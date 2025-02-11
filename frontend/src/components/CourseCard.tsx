import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface Props {
  course: Course;
}

const CourseCard: React.FC<Props> = ({ course }) => {
  return (
    <Card
      sx={{
        height: "100%",
        ":hover": {
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/course/${course.id}`} // Entire card is clickable
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          height: "100%",
        }}
      >
        <CardContent>
          {/* Show each couse, example: "Statistikk (ISTT1003) with description" */}
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            {course.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {course.code}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {course.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CourseCard;
