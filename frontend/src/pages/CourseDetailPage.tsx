import React from "react";
import { useParams } from "react-router-dom";

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams(); 

  return (
    <div>
      <h1>Her kan du finne notater i faget {id}</h1>
    </div>
  );
};
