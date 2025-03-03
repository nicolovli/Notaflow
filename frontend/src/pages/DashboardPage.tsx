import React from "react";
import DashboardAllCourses from "../components/DashboardAllCourses";
import DashboardMostViewedCourses from "../components/DashboardMostViewedCourses";

export const DashboardPage: React.FC = () => {
    return (
      <>
      <DashboardMostViewedCourses />
      <DashboardAllCourses />
      </>
    );
}
export default DashboardPage;