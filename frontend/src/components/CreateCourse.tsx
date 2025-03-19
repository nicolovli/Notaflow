import { useState, useEffect } from "react";
import { createSubject, updateSubject, getSubject } from "../firebase/func/subject";
import { CreateSubject } from "../firebase/interfaces/interface.subject";
import { TextField, CircularProgress, Alert, Paper, Typography, Button, Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../Config/firebase-config";
import { getAdditionalUserData } from "../firebase/func/user";

const CreateCourse = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!courseId);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadedAdminStatus, setLoadedAdminStatus] = useState(false);

  // Error states
  const [nameError, setNameError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          const userData = await getAdditionalUserData(auth.currentUser.uid);
          setLoadedAdminStatus(true);
          setIsAdmin(userData?.isAdmin || false);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAdmin(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (courseId) {
      setIsFetching(true);
      getSubject(courseId)
        .then((course) => {
          setCourseName(course.name);
          setCourseCode(course.subject_code);
          setDescription(course.description);
        })
        .catch((error) => console.error("Error fetching course:", error))
        .finally(() => setIsFetching(false));
    }
  }, [courseId]);

  if (isAdmin === false && loadedAdminStatus) {
    return <Alert severity="error">Du har ikke tilgang til å redigere eller opprette fag.</Alert>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const onSubmit = async () => {
    // Reset errors
    setNameError(null);
    setCodeError(null);
    setDescriptionError(null);

    let hasError = false;

    if (!courseName.trim()) {
      setNameError("Du må skrive inn et fagnavn.");
      hasError = true;
    }

    if (!courseCode.trim()) {
      setCodeError("Du må skrive inn en fagkode.");
      hasError = true;
    }

    if (description.trim().length < 10) {
      setDescriptionError("Beskrivelsen må være på minst 10 tegn.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const courseData: CreateSubject = {
        name: courseName,
        subject_code: courseCode,
        description,
      };

      if (courseId) {
        await updateSubject(courseId, courseData);
        navigate("/", { state: { message: "Faget er oppdatert!" } });
      } else {
        await createSubject(courseData);
        navigate("/", { state: { message: "Faget har blitt opprettet" } });
      }
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8f8f8",
        }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 600,
          p: 3,
          borderRadius: 2,
        }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          {courseId ? "Rediger fag" : "Opprett et nytt fag!"}
        </Typography>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Fagnavn
            </Typography>
            <TextField
              type="text"
              value={courseName}
              error={!!nameError}
              helperText={nameError}
              onChange={(e) => setCourseName(e.target.value)}
              fullWidth
              placeholder="Skriv inn fagnavn..."
            />
          </div>

          <div>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Fagkode
            </Typography>
            <TextField
              type="text"
              value={courseCode}
              error={!!codeError}
              helperText={codeError}
              onChange={(e) => setCourseCode(e.target.value)}
              fullWidth
              placeholder="Skriv inn fagkode (f.eks. TDT4100)..."
            />
          </div>

          <div>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Beskrivelse
            </Typography>
            <TextField
              multiline
              minRows={3}
              value={description}
              error={!!descriptionError}
              helperText={descriptionError}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              placeholder="Skriv en kort beskrivelse av faget..."
            />
          </div>

          <Button
            type="submit"
            onClick={onSubmit}
            disabled={loading}
            variant="contained"
            sx={{ mt: 2 }}>
            {loading ? "Lagrer..." : courseId ? "Oppdater fag" : "Opprett fag"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateCourse;
