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
  Snackbar,
} from "@mui/material";
import Slide, { SlideProps } from "@mui/material/Slide";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DialogActions from "@mui/material/DialogActions";
import { Link } from "react-router-dom";
import { Note } from "../firebase/interfaces/interface.notes";
import { getAdditionalUserData } from "../firebase/func/user";
import { BasicUserInfo } from "../firebase/interfaces/interface.userInfo";
import { auth } from "../Config/firebase-config";
import { deleteNote } from "../firebase/func/notes";

interface Props {
  note: Note;
  onDelete: (noteId: string) => void;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const NoteCard: React.FC<Props> = ({ note, onDelete }) => {
  const currentUser = auth.currentUser;
  const [userInfo, setUserInfo] = useState<BasicUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

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
  }, [note, deleted]);

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

  const handleDelete = async () => {
    try {
      await deleteNote(note.id);
      setSnackbarOpen(true);
      setDeleted(true);
      setTimeout(() => {
        onDelete(note.id);
      }, 2000);
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={SlideTransition}
        message="Ditt notat er nå blitt slettet!"
      />
    </Card>
  );
};

export default NoteCard;
