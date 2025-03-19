import { Alert, Box, Modal, Typography, TextField, Button } from "@mui/material";
import React, { useState } from "react";
import AddMembers from "./AddMembers";
import { createGroup, existsGroupWithMembers } from "../firebase/func/groups";
import { BasicUserInfo } from "../firebase/interfaces/interface.userInfo";

interface CreateGroupPopupProps {
  open: boolean;
  onClose: () => void;
  user_id: string;
}

const CreateGroupPopup: React.FC<CreateGroupPopupProps> = ({ open, onClose, user_id }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [selectedUsers, setSelectedUsers] = useState<BasicUserInfo[]>([]);
  const [groupName, setGroupName] = useState("");
  
  const handleClick = async () => {
    const groupMembers = selectedUsers.map(u => u.id);
    groupMembers.push(user_id);

    // check 
    if(groupName == "") {
        setError("Ikke gyldig gruppenavn");
        return;
    }

    if(selectedUsers.length<1) {
        setError("Ingen medlemmer valg. Du må velge minimum en person");
        return;
    } 

    if(await existsGroupWithMembers(groupMembers)) {
        setError("Denne gruppen finnes allerede");
        return; 
    }

    // no input error
    try {
        await createGroup(groupName, groupMembers);
        setError(null);
        setSuccess(true);
    } catch (error) {
        console.error(error);
        setError("Klarte ikke å opprette gruppe");
    }
  };

  if (!open) return;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="rating-modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          color: "text.primary",
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
          Opprett gruppe
        </Typography>

        <Box sx={{ mt: 2 }}>
            {/* Name of group */}
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                fontFamily: "sans-serif",
              }}>
              Gruppenavn
            </label>
            <TextField
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                fullWidth
                placeholder="Skriv inn Gruppenavn..."
                sx={{
                    marginBottom: 2
                }}
                />

          {/*Members*/}
          <AddMembers selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} group_creator={user_id} />
          {/* Error */}
          {error ? (
               <Alert variant="filled" severity="error" sx={{marginTop: 2}}>
               {error}
             </Alert>
          ): null}

          {success ? (
            <Alert variant="filled" severity="success" sx={{marginTop: 2}}>
                Gruppe ble opprettet!
            </Alert>
          ): null}

          {/*Create Group Button */}
          <Button 
            variant="contained"
            fullWidth
            onClick={handleClick}
            sx={{
                mt: 3,
                mb: 1,
                py: 1.2,
                bgcolor: "#1976d2",
                "&:hover": {
                bgcolor: "#1565c0",
                },
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 1.5,
                boxShadow: "0px 3px 5px rgba(0,0,0,0.1)",
            }}
            >
            Opprett Gruppe
        </Button>


        </Box>
      </Box>
    </Modal>
  );
};

export default CreateGroupPopup;