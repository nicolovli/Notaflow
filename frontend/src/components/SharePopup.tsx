import React, { useEffect, useState } from "react";
import { Box, Modal, Alert, Typography, IconButton } from "@mui/material";
import { Group } from "../firebase/interfaces/interface.groups";
import { getUserGroups, shareNote } from "../firebase/func/groups";
import { IosShare } from "@mui/icons-material";
import GroupAvatar from "./GroupAvatar";
import truncateString from "../util/truncate";

interface SharePopupProps {
  open: boolean;
  onClose: () => void;
  user_id: string;
  note_id: string;
}

const SharePopup: React.FC<SharePopupProps> = ({ open, onClose, user_id, note_id }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const getGroups = async () => {
      try {
        const _groups = await getUserGroups(user_id);
        setGroups(_groups);
        setIsLoading(false);
      } catch (err) {
        console.error("An error occured while trying to fetch groups: ", err);
        setError(err instanceof Error ? err.message : "Failed to fetch groups");
      }
    };
    getGroups();
  }, [user_id]);

  const handleClick = async (g: Group) => {
    try {
      await shareNote(note_id, g.id, user_id);
      onClose();
      open = !open;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to share note");
    }
  };

  if (!open || isLoading) return;

  if (error) {
    return (
      <Alert variant="filled" severity="error">
        An error occurred. Check your network connection
      </Alert>
    );
  }

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="rating-modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#ffffff",
          p: 4,
          borderRadius: 2,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
          maxWidth: 500,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}>
        <Typography
          id="rating-modal-title"
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "1px solid #eaeaea",
            paddingBottom: 2,
          }}>
          Del med gruppe
        </Typography>

        <Box sx={{ mt: 2 }}>
          {groups.map((g) => (
            <Box
              onClick={() => handleClick(g)}
              key={g.id}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                mb: 2,
                borderRadius: 5,
                backgroundColor: "#f5f5f5",
                transition: "all 0.2s ease",
                cursor: "pointer",
                border: "1px solid transparent",
                "&:hover": {
                  backgroundColor: "#e8f4fd",
                  borderColor: "#2196f3",
                  transform: "translateY(-2px)",
                },
              }}>
              <GroupAvatar group={g} />

              <Typography
                variant="h6"
                sx={{
                  ml: 2,
                  fontWeight: "600",
                  fontSize: "1rem",
                  flex: 1,
                }}>
                {truncateString(g.name, 18)}
              </Typography>
              <IconButton
                size="small"
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "rgba(33, 150, 243, 0.1)",
                  },
                }}>
                <IosShare fontSize="medium" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default SharePopup;
