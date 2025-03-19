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
  useTheme,
} from "@mui/material";
import { Group } from "../firebase/interfaces/interface.groups";
import { getGroupNotes, getSortedUserGroups, GroupSortOption } from "../firebase/func/groups";
import { auth } from "../Config/firebase-config";
import { Note } from "../firebase/interfaces/interface.notes";
import NoteCard from "./NoteCard";
import { getAdditionalUserData } from "../firebase/func/user";
import { Timestamp } from "firebase/firestore";
import GroupAvatar from "./GroupAvatar";
import { Add as AddIcon } from "@mui/icons-material";
import CreateGroupPopup from "./CreateGroupPopup";
import truncateString from "../util/truncate";

const drawerWidth = 240;

interface SharedNoteWithNoteData {
  note_data: Note;
  shared_metadata: {
    shared_by_id: string;
    shared_by_name: string;
    date: string;
  };
}

const PrivateGroupComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupNotes, setGroupNotes] = useState<SharedNoteWithNoteData[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState<boolean>(false);
  const [rerender, setRerender] = useState<number>(0);

  const notesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const getGroups = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("Bruker er ikke logget inn");
          return;
        }

        const userGroups = await getSortedUserGroups(
          user.uid,
          GroupSortOption.MOST_RECENT_ACTIVITY_DESC
        );
        setGroups(userGroups);
        if (userGroups.length > 0) handleGroupClick(userGroups[0]);
      } catch (err) {
        console.error("Feil ved innhenting av grupper", err);
        setError(err instanceof Error ? err.message : "Kunne ikke hente brukerens grupper");
      } finally {
        setIsLoading(false);
      }
    };

    getGroups();
  }, [rerender]);

  if (!auth.currentUser) return;

  const handleGroupClick = async (group: Group) => {
    if (!group.id) {
      console.error("Group.id is undefined");
      return;
    }

    setSelectedGroup(group);
    setLoadingNotes(true);

    try {
      const notes = await getGroupNotes(group.id);

      let enrichedNotes = await Promise.all(
        group.shared_notes.map(async (sharedNote) => {
          const note = notes.find((note) => note.id === sharedNote.note_id);
          if (!note) {
            return;
          }

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

          // return {
          //   ...note,
          //   share_by_user_id: sharedNote?.shared_by || "",
          //   shared_by: sharedByFullName,
          //   shared_date: formattedDate,
          // };
          return {
            note_data: note,
            shared_metadata: {
              shared_by_id: sharedNote?.shared_by,
              shared_by_name: sharedByFullName,
              date: formattedDate,
            },
          } as SharedNoteWithNoteData;
        })
      );

      enrichedNotes = enrichedNotes.filter((n) => n !== undefined);

      enrichedNotes.sort((a, b) => {
        const dateA = new Date(a.shared_metadata.date).getTime();
        const dateB = new Date(b.shared_metadata.date).getTime();
        return dateA - dateB;
      });

      console.log(enrichedNotes);

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
    <Box style={{ display: "flex", minWidth: "100%" }}>
      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          bgcolor: theme.palette.background.paper,
        }}>
        <Toolbar disableGutters sx={{ pl: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6">Mine grupper</Typography>
        </Toolbar>

        <Divider />

        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => setCreateGroupOpen(true)}
          sx={{ width: "100%", height: "48px", p: 0, boxShadow: 0, borderRadius: 0 }}>
          <AddIcon fontSize="small" />
          <Typography
            sx={{
              marginLeft: 1,
              textTransform: "none",
            }}>
            Opprett Gruppe
          </Typography>
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
              <Box key={group.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleGroupClick(group)}
                    sx={{
                      bgcolor:
                        selectedGroup?.id === group.id
                          ? theme.palette.background.default
                          : theme.palette.background.paper,
                      "&:hover": {
                        backgroundColor: theme.palette.background.default,
                      },
                      height: 48,
                      display: "flex",
                    }}>
                    <GroupAvatar group={group} size={30} />
                    <ListItemText sx={{ marginLeft: 2 }} primary={truncateString(group.name, 13)} />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </Box>
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
          minHeight: "100%",
        }}>
        {selectedGroup && (
          <Box sx={{ maxHeight: "92.5vh", overflowY: "auto" }}>
            <Box
              sx={{
                position: "sticky",
                top: "0",
                bgcolor: theme.palette.background.paper,
                zIndex: 100,
              }}>
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
                  const isCurrentUser = note.shared_metadata.shared_by_id === auth.currentUser?.uid;

                  return (
                    <Grid
                      item
                      xs={12}
                      key={`${note.note_data.id}-${index}`}
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
                          Delt av {note.shared_metadata.shared_by_name} den{" "}
                          {note.shared_metadata.date}
                        </Typography>
                        <Box sx={{ marginTop: 1 }}>
                          <NoteCard note={note.note_data} />
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
      {createGroupOpen ? (
        <CreateGroupPopup
          open={createGroupOpen}
          onClose={() => {
            setCreateGroupOpen(false);
            setRerender(rerender + 1);
          }}
          user_id={auth.currentUser.uid}
        />
      ) : null}
    </Box>
  );
};

export default PrivateGroupComponent;
