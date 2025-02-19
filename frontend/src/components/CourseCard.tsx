import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Link } from "react-router-dom";
import { Subject } from "../firebase/interfaces/interface.subject";


interface Props {
  course: Subject;
}

const CourseCard: React.FC<Props> = ({ course }) => {
  const truncateDescription = (text: string, maxLength: number = 180)  => {
    if (text.length <= maxLength) return text;
    
    // Cut at maxLength and then find the last space before that point
    const truncated = text.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    // Return everything up to the last space plus ellipsis
    return truncated.substr(0, lastSpace) + '...';
  }

  const courseDescription = truncateDescription(course.description);

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
        state={{course}}
      >
        <CardContent>
          {/* Show each couse, example: "Statistikk (ISTT1003) with description" */}
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            {course.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {course.subject_code}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {courseDescription}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CourseCard;
