import React from "react";
import PrivateGroupComponent from "../components/PrivateGroups.tsx";
import { Box } from "@mui/material";

const PrivateGroupsPage: React.FC = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100%", zIndex: 10 }}>
      <PrivateGroupComponent />
    </Box>
  );
};

export default PrivateGroupsPage;
