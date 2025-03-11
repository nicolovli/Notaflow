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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DialogActions from "@mui/material/DialogActions";
import { Link, useNavigate } from "react-router-dom";
import { Note } from "../firebase/interfaces/interface.notes";
import { getAdditionalUserData } from "../firebase/func/user";
import { BasicUserInfo } from "../firebase/interfaces/interface.userInfo";
import { auth } from "../Config/firebase-config";
import { deleteNote } from "../firebase/func/notes";

interface Props {
  note: Note;
  onDelete: (noteId: string) => void;
}

const NoteCard: React.FC<Props> = ({ note, onDelete }) => {
  const currentUser = auth.currentUser;
  const [userInfo, setUserInfo] = useState<BasicUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const [currentUserFirebase, setCurrentUserFirebase] = useState<BasicUserInfo | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userData = await getAdditionalUserData(currentUser.uid);
        setCurrentUserFirebase(userData);
      }
    };

    fetchUserData();
  }, [currentUser]);

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
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/publishingpage/${note.id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await deleteNote(note.id);
      window.history.replaceState(
        { ...window.history.state, usr: { message: "Notatet er slettet!" } },
        ""
      );
      onDelete(note.id);
    } catch (err) {
      console.error("Failed to delete note:", err);
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
      {(currentUser?.uid === note.user_id || currentUserFirebase?.isAdmin === true) && (
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
            {currentUserFirebase?.isAdmin === false ||
            (currentUser?.uid === note.user_id) === true ? (
              <MenuItem onClick={handleEdit}>Rediger</MenuItem>
            ) : null}
            <MenuItem onClick={() => setOpen(true)}>Slett</MenuItem>
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Bekreft sletting</DialogTitle>
        <DialogContent>
          <DialogContentText>Er du sikker på at du vil slette dette notatet?</DialogContentText>
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

export default NoteCard;
