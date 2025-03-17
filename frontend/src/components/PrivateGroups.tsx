import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  CircularProgress,
  Grid,
  Button,
} from "@mui/material";
import { Group } from "../firebase/interfaces/interface.groups";
import { getGroupNotes, getSortedUserGroups, GroupSortOption } from "../firebase/func/groups";
import { auth } from "../Config/firebase-config";
import { Note } from "../firebase/interfaces/interface.notes";
import NoteCard from "./NoteCard";
import { getAdditionalUserData } from "../firebase/func/user";
import { Timestamp } from "firebase/firestore";
import GroupAvatar from "./GroupAvatar";
import {Add as AddIcon} from "@mui/icons-material";
import CreateGroupPopup from "./CreateGroupPopup";
import truncateString from "../util/truncate";

const drawerWidth = 240;

const PrivateGroupComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupNotes, setGroupNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState<boolean>(false);
  const [rerender, setRerender] = useState<number>(0);
  
  const notesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getGroups = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("Bruker er ikke logget inn");
          return;
        }

        const userGroups = await getSortedUserGroups(user.uid, GroupSortOption.MOST_RECENT_ACTIVITY_DESC);
        setGroups(userGroups);
        if(userGroups.length > 0)
          handleGroupClick(userGroups[0])
      } catch (err) {
        console.error("Feil ved innhenting av grupper", err);
        setError(err instanceof Error ? err.message : "Kunne ikke hente brukerens grupper");
      } finally {
        setIsLoading(false);
      }
    };

    getGroups();
  }, [rerender]);

  if(!auth.currentUser)
    return

  const handleGroupClick = async (group: Group) => {
    if (!group.id) {
      console.error("Group.id is undefined");
      return;
    }

    setSelectedGroup(group);
    setLoadingNotes(true);

    try {
      const notes = await getGroupNotes(group.id);

      const enrichedNotes = await Promise.all(
        notes.map(async (note) => {
          const sharedNote = group.shared_notes?.find((sn) => sn.note_id === note.id);

          let sharedByFullName = "Ukjent";
          if (sharedNote?.shared_by) {
            try {
              const userData = await getAdditionalUserData(sharedNote.shared_by);
              sharedByFullName = `${userData.firstName} ${userData.lastName}`;
            } catch (error) {
              console.error(`Kunne ikke hente brukerinfo for ${sharedNote.shared_by}`, error);
            }
          }

          const formattedDate = sharedNote?.date
            ? (sharedNote.date as unknown as Timestamp).toDate().toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Ukjent dato";

          return {
            ...note,
            share_by_user_id: sharedNote?.shared_by || "",
            shared_by: sharedByFullName,
            shared_date: formattedDate,
          };
        })
      );

      enrichedNotes.sort((a, b) => {
        const dateA = new Date(a.shared_date).getTime();
        const dateB = new Date(b.shared_date).getTime();
        return dateA - dateB;
      });

      setGroupNotes(enrichedNotes);
    } catch (error) {
      console.error("Error fetching group notes:", error);
    } finally {
      setLoadingNotes(false);

      notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (groupNotes.length > 0) {
      notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupNotes]);

  return (
    <div style={{ display: "flex", minWidth: "100%" }}>
      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          minHeight: "100%",
        }}>
        <Toolbar disableGutters sx={{ pl: 2 }}>
          <Typography variant="h6" sx={{ color: "black" }}>
            Mine grupper
          </Typography>
        </Toolbar>

        <Divider />

        <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => setCreateGroupOpen(true)}
            sx={{ width: "100%", height: "48px", p: 0, boxShadow: 0, borderRadius: 0}}
          >
            <AddIcon fontSize="small" />
          <Typography
          sx={{
            marginLeft: 1,
            textTransform: "none"
          }}
          >Opprett Gruppe</Typography>
        </Button>


        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ padding: 2 }}>
            {error}
          </Typography>
        ) : groups.length === 0 ? (
          <Typography sx={{ padding: 2, textAlign: "center" }}>Ingen grupper funnet</Typography>
        ) : (
          <List disablePadding>
            {groups.map((group) => (
              <div key={group.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleGroupClick(group)}
                    sx={{
                      backgroundColor:
                        selectedGroup?.id === group.id ? "rgba(63, 81, 181, 0.2)" : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(63, 81, 181, 0.1)",
                      },
                      height: 48,
                      display: "flex"
                    }}>
                      <GroupAvatar group={group} size={30}/><ListItemText sx={{marginLeft: 2}} primary={truncateString(group.name, 13)} />
                    
                  </ListItemButton>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        )}

      </Box>
   
      <Divider orientation="vertical" flexItem />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8f8f8",
          minHeight: "100%",
        }}>
        {selectedGroup && (
          <Box sx={{ maxHeight: "92.5vh", overflowY: "auto" }}>
            <Box sx={{ position: "sticky", top: "0", backgroundColor: "white", zIndex: 1000 }}>
              <Toolbar disableGutters sx={{ pl: 2 }}>
                <Typography variant="h6">{selectedGroup.name}</Typography>
              </Toolbar>
              <Divider />
            </Box>
            {loadingNotes ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexGrow: 1,
                  height: "100%",
                }}>
                <CircularProgress />
              </Box>
            ) : groupNotes.length === 0 ? (
              <Typography sx={{ textAlign: "center", paddingTop: 4 }}>
                Ingen notater i denne gruppen
              </Typography>
            ) : (
              <Grid container spacing={2} sx={{ padding: 2, flexDirection: "column" }}>
                {groupNotes.map((note, index) => {
                  const isCurrentUser = note.share_by_user_id === auth.currentUser?.uid;

                  return (
                    <Grid
                      item
                      xs={12}
                      key={`${note.id}-${index}`}
                      sx={{
                        display: "flex",
                        justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                      }}>
                      <Box
                        sx={{
                          minWidth: "35%",
                          backgroundColor: isCurrentUser ? "#e3f2fd" : "#f1f1f1",
                          padding: 2,
                          borderRadius: 2,
                        }}>
                        <Typography variant="caption" sx={{ color: "gray", display: "block" }}>
                          Delt av {note.shared_by} den {note.shared_date}
                        </Typography>
                        <Box sx={{ marginTop: 1 }}>
                          <NoteCard
                            note={note}
                            onDelete={(noteId: string) =>
                              console.log(`Delete note with id: ${noteId}`)
                            }
                          />
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
                <div ref={notesEndRef} />
              </Grid>
            )}
          </Box>
        )}
      </Box>
      {createGroupOpen ? <CreateGroupPopup open={createGroupOpen} onClose={() => {
        setCreateGroupOpen(false)
        setRerender(rerender+1);
        }} user_id={auth.currentUser.uid}/> : null}
    </div>
  );
};

export default PrivateGroupComponent;
