import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Link, useNavigate } from "react-router-dom";
import { Subject } from "../firebase/interfaces/interface.subject";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { auth } from "../Config/firebase-config";
import { getAdditionalUserData } from "../firebase/func/user";
import { BasicUserInfo } from "../firebase/interfaces/interface.userInfo";
import { deleteSubject } from "../firebase/func/subject";
interface Props {
  course: Subject;
  onDelete: (courseId: string) => void;
}

const CourseCard: React.FC<Props> = ({ course, onDelete }) => {
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const [currentUserFirebase, setCurrentUserFirebase] = useState<BasicUserInfo | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userData = await getAdditionalUserData(currentUser.uid);
        setCurrentUserFirebase(userData);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const truncateDescription = (text: string, maxLength: number = 180) => {
    if (text.length <= maxLength) return text;

    // Cut at maxLength and then find the last space before that point
    const truncated = text.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    // Return everything up to the last space plus ellipsis
    return truncated.substr(0, lastSpace) + "...";
  };

  const courseDescription = truncateDescription(course.description);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/createCourse/${course.id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await deleteSubject(course.id);
      navigate("/", { state: { message: "Faget er slettet!" } });
      onDelete(course.id);
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
    handleMenuClose();
    setOpen(false);
  };

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        ":hover": {
          boxShadow: 4,
        },
      }}>
      {currentUserFirebase?.isAdmin === true && (
        <>
          <IconButton
            aria-label="options"
            onClick={handleMenuClick}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              },
            }}>
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}>
            <MenuItem onClick={handleEdit}>Rediger</MenuItem>
            <MenuItem onClick={() => setOpen(true)}>Slett</MenuItem>
          </Menu>
        </>
      )}
      <CardActionArea
        component={Link}
        to={`/course/${course.id}`} // Entire card is clickable
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          height: "100%",
        }}
        state={{ course }}>
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

      {/* Dialog for confirming deletion */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Bekreft sletting</DialogTitle>
        <DialogContent>
          <DialogContentText>Er du sikker på at du vil slette dette kurset?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Ikke slett</Button>
          <Button onClick={handleDelete} autoFocus>
            Slett
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CourseCard;
