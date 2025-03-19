import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addComment,
  addNoteRating,
  getNote,
  hasUserRatedNote,
  incrementNoteViewCount,
} from "../firebase/func/notes";
import {
  Note,
  NoteComment,
  NoteRating,
  AccessPolicyType,
  stringToAccessPolicyType,
  accessPolicyTypeToString,
} from "../firebase/interfaces/interface.notes";
import { getSubject } from "../firebase/func/subject";
import { Subject } from "../firebase/interfaces/interface.subject";
import { addFavorite, removeFavorite, isFavorite } from "../firebase/func/favorites";
import { getAverageRating } from "../firebase/func/notes";
import SharePopup from "../components/SharePopup";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import RatingPopup from "../components/FloatingRatingBox";
import { IosShare, Star as StarIcon } from "@mui/icons-material";
import "../assets/style.css";
import { auth } from "../Config/firebase-config";
import { getAdditionalUserData } from "../firebase/func/user";
import { BasicUserInfo } from "../firebase/interfaces/interface.userInfo";
import {
  CircularProgress,
  Alert,
  Tooltip,
  Typography,
  Chip,
  Rating,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
} from "@mui/material";
import { isUserMemberOfOneGroup } from "../firebase/func/groups";

export const NotePage: React.FC = () => {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [isNoteFavorite, setIsNoteFavorite] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [hasUserRated, setHasUserRated] = useState<boolean>(true);
  const [shareOpen, setShareOpen] = useState<boolean>(false);

  const [comment, setComment] = useState("");
  const [commentUser, setCommentUser] = useState<{ [uid: string]: BasicUserInfo }>({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (id == undefined) {
          throw new Error("ID not set correctly");
        } else {
          const _note = await getNote(id);
          // check access policy
          if (
            _note.access_policy.type == accessPolicyTypeToString(AccessPolicyType.PRIVATE) &&
            auth.currentUser?.uid !== _note.user_id
          ) {
            return;
          }

          if (_note.access_policy.type == accessPolicyTypeToString(AccessPolicyType.GROUP)) {
            if (!auth.currentUser) return;
            if (
              !(
                (await isUserMemberOfOneGroup(
                  _note.access_policy.allowed_groups || [],
                  auth.currentUser.uid
                )) || _note.user_id === auth.currentUser.uid
              )
            ) {
              console.log(_note.access_policy.allowed_groups);
              console.log("not member");
              return;
            }
          }
          setNote(_note);
          if (_note == null) {
            throw new Error("Error with note");
          }
          setAverageRating(getAverageRating(_note.note_ratings));
          const subject = await getSubject(_note.subject_id);
          setSubject(subject);

          const _uid = auth.currentUser?.uid;
          if (!_uid) {
            setUid(null);
            return;
          }
          setUid(_uid);
          setHasUserRated(hasUserRatedNote(_uid, _note.note_ratings));

          const _notefav: boolean = await isFavorite(_uid, _note.id);
          setIsNoteFavorite(_notefav);

          incrementNoteViewCount(id); // increment because user can now view page

          // Fetch user info for comment owners
          if (_note.note_comments && _note.note_comments.length > 0) {
            const uniqueUserIds = Array.from(
              new Set(_note.note_comments.map((c) => c.comment_by_uid))
            );

            // Fire off parallel requests
            const userPromises = uniqueUserIds.map((u) => getAdditionalUserData(u));
            const users = await Promise.all(userPromises);

            // Build a lookup dictionary { [uid]: BasicUserInfo }
            const userMap: { [uid: string]: BasicUserInfo } = {};
            users.forEach((userInfo) => {
              userMap[userInfo.id] = userInfo;
            });
            setCommentUser(userMap);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch subjects");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleToggleFavorite = () => {
    if (!uid || !note) return;
    if (isNoteFavorite) removeFavorite(uid, note.id);
    else addFavorite(uid, note.id);
    setIsNoteFavorite(!isNoteFavorite);
  };

  const handleSaveRating = async (newRating: number) => {
    if (!note || !auth.currentUser || hasUserRated)
      throw new Error("Not logged in, no note or user has already rated note");

    const noteRating: NoteRating = {
      rating: newRating,
      rated_by_uid: auth.currentUser.uid,
      date: new Date(),
    };

    await addNoteRating(note.id, noteRating);
    setHasUserRated(true);
    note.note_ratings.push(noteRating);
    setAverageRating(getAverageRating(note.note_ratings));
    setRatingOpen(false);
  };

  const handleSaveComment = async (newComment: string) => {
    if (!note || !auth.currentUser) throw new Error("Not logged in or no note");

    const NoteComment: NoteComment = {
      comment: newComment.trim(),
      comment_by_uid: auth.currentUser.uid,
      date: new Date(),
    };

    if (NoteComment.comment.length > 0 || NoteComment.comment == null) {
      await addComment(note.id, NoteComment);
      note.note_comments.push(NoteComment);
      setComment("");
    }

    // If the comment’s user wasn’t already in commentUsers, fetch and store
    const commentOwnerUid = NoteComment.comment_by_uid;
    if (!commentUser[commentOwnerUid]) {
      const fetchedUser = await getAdditionalUserData(commentOwnerUid);
      setCommentUser((prev) => ({ ...prev, [fetchedUser.id]: fetchedUser }));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  } else if (error || note == null || subject == null) {
    return (
      <Alert variant="filled" severity="error">
        An error occurred. Check your network connection
      </Alert>
    );
  } else {
    return (
      <Box className="relative flex justify-start items-center place-items-center flex-col">
        {/* Everything on right side */}
        <Box
          className="flex flex-col gap-4 mt-6 mb-4 relative max-w-3xl w-full p-20 h-full font-sans top-2"
          style={{
            paddingBottom: 20,
            marginBottom: 20,
            marginTop: 15,
          }}>
          <Box className="flex items-center justify-center gap-4 0">
            {/* Favorites */}
            {uid ? (
              <Tooltip title={isNoteFavorite ? "Remove from favorites" : "Add to favorites"}>
                <Chip
                  icon={
                    isNoteFavorite ? (
                      <FavoriteIcon style={{ color: "red" }} />
                    ) : (
                      <FavoriteBorderIcon style={{ color: "red" }} />
                    )
                  }
                  label={isNoteFavorite ? "Remove from favorites" : "Add to favorites"}
                  onClick={handleToggleFavorite}
                  variant="outlined"
                  sx={{
                    borderRadius: "20px",
                    color: isNoteFavorite ? "red" : "gray",
                    borderColor: isNoteFavorite ? "red" : "gray",
                    "&:hover": {
                      backgroundColor: "rgba(255, 0, 0, 0.04)",
                      cursor: "pointer",
                    },
                    padding: "0 8px",
                    height: "36px",
                    backgroundColor: "white",
                    boxShadow:
                      "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
                  }}
                  aria-label={isNoteFavorite ? "remove from favorites" : "add to favorites"}
                />
              </Tooltip>
            ) : null}

            {/* note rating*/}
            {stringToAccessPolicyType(note.access_policy.type) == AccessPolicyType.PUBLIC ? (
              <Chip
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      ml: -1,
                    }}>
                    <Rating
                      value={averageRating}
                      precision={0.5}
                      readOnly
                      size="small"
                      sx={{
                        fontSize: "0.85rem",
                        mr: -0.5,
                        marginLeft: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        marginLeft: 0.5,
                        marginTop: 0.5,
                      }}
                      variant="body2">
                      Rating: {averageRating.toFixed(1)}
                    </Typography>
                  </Box>
                }
                variant="outlined"
                sx={{
                  borderRadius: "20px",
                  color: "gray",
                  backgroundColor: "white",
                  borderColor: "gray",
                  padding: "0 8px",
                  height: "36px",
                  cursor: "default",
                  "& .MuiChip-label": {
                    display: "flex",
                    padding: "0 8px 0 4px",
                  },
                  boxShadow:
                    "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
                }}
                aria-label={`Average rating is ${averageRating.toFixed(1)} stars`}
              />
            ) : null}

            {/* Rate note button */}
            {uid &&
            uid != note.user_id &&
            !hasUserRated &&
            stringToAccessPolicyType(note.access_policy.type) === AccessPolicyType.PUBLIC ? (
              <Tooltip title="Rate note">
                <Chip
                  icon={<StarIcon style={{ color: "gold" }} />}
                  label="Rate note"
                  onClick={() => setRatingOpen(true)}
                  variant="outlined"
                  sx={{
                    borderRadius: "20px",
                    color: "gray",
                    borderColor: "gray",
                    "&:hover": {
                      backgroundColor: "rgba(255, 215, 0, 0.04)",
                      cursor: "pointer",
                    },
                    padding: "0 8px",
                    height: "36px",
                    backgroundColor: "white",
                    boxShadow:
                      "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
                  }}
                  aria-label="rate note"
                />
              </Tooltip>
            ) : null}

            {/*share*/}
            {uid ? (
              <Tooltip title="Share note" onClick={() => setShareOpen(!shareOpen)}>
                <Chip
                  icon={<IosShare sx={{ fontSize: 20 }} style={{ color: "#3b82f6" }} />}
                  label="Share note"
                  variant="outlined"
                  sx={{
                    borderRadius: "20px",
                    color: "gray",
                    borderColor: "gray",
                    "&:hover": {
                      backgroundColor: "rgba(59, 130, 246, 0.04)",
                      cursor: "pointer",
                    },
                    padding: "0 8px",
                    height: "36px",
                    backgroundColor: "white",
                    boxShadow:
                      "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
                  }}
                  aria-label="share note"
                />
              </Tooltip>
            ) : null}
          </Box>

          {/* Share popup */}
          {uid ? (
            <SharePopup
              open={shareOpen}
              onClose={() => setShareOpen(false)}
              user_id={uid}
              note={note}
            />
          ) : null}

          {/* RatingPopup */}
          <RatingPopup
            open={ratingOpen}
            onClose={() => setRatingOpen(false)}
            onSave={handleSaveRating}
            noteTitle={note.title}
          />
        </Box>

        <Paper
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginBottom: 20,
            boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
            borderRadius: 20,
          }}
          className="relative max-w-3xl w-full p-20 h-full font-sans bg-white overflow-hidden">
          <div
            style={{
              padding: 30,
              minHeight: "calc(100vh - 200px)",
            }}
            className="p-10 w-full h-full">
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
              {note.title}
            </Typography>

            <Typography
              style={{
                paddingBottom: 20,
                marginBottom: 20,
              }}
              className="text-lg font-medium border-b-gray-200 border-b mb-4">
              {subject.name} ({subject.subject_code})
            </Typography>

            <Box className={"flex justify-start  border-b-gray-200 border-b !pb-5 !pt-2"}>
              {note.theme && Array.isArray(note.theme) && note.theme.length > 0
                ? note.theme.map((theme, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center justify-center w-fit min-w-[60px] max-h-[30px] !px-2 !mr-2 rounded-full bg-purple-100 border border-purple-600 text-purple-700 text-xs font-medium ">
                      {theme}
                    </span>
                  ))
                : null}
            </Box>
            <Box
              id="content"
              className="prose prose-lgleading-relaxed mt-6"
              marginTop={2}
              dangerouslySetInnerHTML={{ __html: note.content }}></Box>
          </div>
        </Paper>

        {/* <div
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginBottom: 20,
            boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
            borderRadius: 20
          }}
          className="relative max-w-3xl w-full p-20 h-full font-sans bg-white overflow-hidden"> */}

        {/* Comments */}
        {stringToAccessPolicyType(note.access_policy.type) === AccessPolicyType.PUBLIC ? (
          <Paper
            style={{
              marginLeft: 20,
              marginRight: 20,
              marginBottom: 20,
              boxShadow:
                "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
              borderRadius: 20,
            }}
            className="relative max-w-3xl w-full p-20 h-full font-sans overflow-hidden">
            <Card className="w-full shadow-lg rounded-2xl">
              <CardContent className="p-6 space-y-4">
                {/* Tittel */}
                <Typography variant="h5" className="font-semibold">
                  Kommenter notat
                </Typography>
                <Divider />

                {/* Input-felt */}
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Skriv en kommentar..."
                  value={comment}
                  sx={{ "& fieldset": { border: "none" } }}
                  onChange={(e) => setComment(e.target.value)}
                  multiline
                  rows={3}
                  className="rounded-lg"
                />

                {/* className="relative max-w-3xl w-full p-20 h-full font-sans bg-white overflow-hidden">
        <Card className="w-full shadow-lg rounded-2xl border border-gray-200">
          <CardContent className="p-6 space-y-4"> */}
                {/* Tittel */}
                {/* <Typography variant="h5" className="text-gray-900 font-semibold">
              Kommenter notat
            </Typography>
            <Divider/> */}

                {/* Publiser-knapp */}
                <div className="flex justify-end">
                  <Button
                    variant="contained"
                    onClick={() => handleSaveComment(comment)}
                    sx={{
                      backgroundColor: "#2563eb",
                      color: "white",
                      fontWeight: "medium",
                      paddingX: 3,
                      paddingY: 1,
                      borderRadius: "8px",
                      minWidth: "120px",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#1e40af" },
                    }}>
                    Publiser
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* List of existing comments */}
            <CardContent>
              {note.note_comments && note.note_comments.length > 0 ? (
                note.note_comments.map((c, idx) => {
                  const owner = commentUser[c.comment_by_uid];
                  return (
                    <Card key={idx} sx={{ mb: 2, boxShadow: 1 }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {owner ? `${owner.firstName} ${owner.lastName}` : "Loading user..."}
                        </Typography>
                        <Divider />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {c.comment}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {c.date.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Typography variant="body2">Ingen kommentarer ennå.</Typography>
              )}
            </CardContent>
          </Paper>
        ) : null}
      </Box>
    );
  }
};

export default NotePage;
