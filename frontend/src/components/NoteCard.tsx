import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import {
  CircularProgress,
  Divider,
  Typography,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link } from "react-router-dom";
import { Note } from "../firebase/interfaces/interface.notes";
import { getAdditionalUserData } from "../firebase/func/user";
import { BasicUserInfo } from "../firebase/interfaces/interface.userInfo";
import { auth } from "../Config/firebase-config";

interface Props {
  note: Note;
}

const NoteCard: React.FC<Props> = ({ note }) => {
  const currentUser = auth.currentUser;
  const [userInfo, setUserInfo] = useState<BasicUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const _userInfo = await getAdditionalUserData(note.user_id);
        setUserInfo(_userInfo);
      } catch (err) {
        console.log(err);
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [note]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Stopper klikket fra å trigge navigasjon
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    // console.log("Edit note", note.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    // console.log("Delete note", note.id);
    handleMenuClose();
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
      {currentUser?.uid === note.user_id && (
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
                backgroundColor: "rgba(255, 255, 255, 0)",
              },
            }}>
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}>
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
        </>
      )}
      <CardActionArea
        component={Link}
        to={`/notes/${note.id}`} // Entire card is clickable
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          height: "100%",
        }}>
        <CardContent>
          {/* Show each couse, example: "Statistikk (ISTT1003) with description" */}
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            {note.title}
          </Typography>
          <Divider sx={{ my: 1 }} />

          {isLoading ? (
            <CircularProgress size={21.5} />
          ) : error ? (
            <Typography variant="subtitle1" color="text.secondary">
              Error loading user
            </Typography>
          ) : (
            <Typography variant="subtitle1" color="text.secondary">
              Laget av: {userInfo?.firstName} {userInfo?.lastName}
            </Typography>
          )}

          <Typography variant="subtitle1" color="text.secondary">
            Laget: {note.date.toDateString()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default NoteCard;
