import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { createNote, updateNote, getNote } from "../firebase/func/notes";
import { getSubject } from "../firebase/func/subject";
import { AccessPolicyType, CreateNoteInput, Note } from "../firebase/interfaces/interface.notes";
import { auth } from "../Config/firebase-config";
import { stringToAccessPolicyType } from "../firebase/interfaces/interface.notes";
//import { AccessPolicyType } from "../firebase/interfaces/interface.notes";
import { Subject } from "../firebase/interfaces/interface.subject";
import { Category } from "../firebase/interfaces/interface.category";
import { TextField, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import CategorySelector from "./CategorySelector";
import CourseSelector from "./courseSelector";
import ThemeField from "./ThemeField";

const FormComponent = () => {
  const { id: noteId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [option, setOption] = useState("public");
  const [text, setText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  //Error fields
  const [titleError, setTitleError] = useState<string | null>(null);
  const [optionError, setOptionError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const [selectedSubjectError, setSelectedSubjectError] = useState<string | null>(null);

  const [note, setNote] = useState<Note|null>(null);

  useEffect(() => {
    if (!noteId) {
      setTitle("");
      setText("");
      setSelectedSubject(null);
      setResetKey((prev) => prev + 1);
      setSelectedCategories([]);
      setSelectedThemes([]);
      return;
    }
    setLoading(true);
    getNote(noteId)
      .then(async (note) => {
        setTitle(note.title);
        setText(note.content);
        setSelectedThemes(note.theme || []);
        setOption(note.access_policy.type);
        setSelectedCategories(note.tag.map(tag => ({ id: tag, name: tag, tag: tag })));
        setSelectedThemes(note.theme);
        setNote(note);
        // setOption(note.access_policy.type);

        try {
          const subject = await getSubject(note.subject_id);
          setSelectedSubject(subject);
          setLoading(false);
        } catch (error) {
          console.error("Kunne ikke hente faget:", error);
        }
      })
      .catch((error) => {
        console.error("Error fetching note:", error);
      })
      .finally(() => {});
  }, [noteId]);

  //Send in form
  const onSubmit = async (e: React.FormEvent) => {
    if(!note)
      return
    // Reset errormessages
    setSelectedSubjectError(null);
    setTitleError(null);
    setTextError(null);

    e.preventDefault();

    setOptionError(null);
    setSelectedSubjectError(null);
    setTitleError(null);
    setTextError(null);


    if (title.trim().length === 0) {
      setTitleError("Du må skrive inn en tittel for notatet");
      return;
    }

    if (text.trim().length < 20) {
      setTextError("Du må skrive inn tekst i notatet. Må være på minst 20 tegn.");
      return;
    }

    if (!selectedSubject) {
      setSelectedSubjectError("Du må velge et fag");
      return; 
    }

    if (!option) {
      setOptionError("Du må velge en tilgjengelighet");
      return;
    }

    let selectedAccessPolicy = stringToAccessPolicyType(option);
    const currentAccessPolicy = stringToAccessPolicyType(note.access_policy.type);
    if(selectedAccessPolicy === AccessPolicyType.PRIVATE && currentAccessPolicy === AccessPolicyType.GROUP){ 
      selectedAccessPolicy = AccessPolicyType.GROUP;
    } else if(selectedAccessPolicy === AccessPolicyType.PRIVATE && currentAccessPolicy === AccessPolicyType.PUBLIC && note.access_policy.allowed_groups) {
      if(note.access_policy.allowed_groups.length > 0) {
        selectedAccessPolicy = AccessPolicyType.GROUP;
      }
    }

    //Create input
    const input: CreateNoteInput = {
      user_id: auth.currentUser?.uid ?? "unkown user",
      subject_id: selectedSubject?.id ?? "empty",
      title: title,
      content: text,
      tag: selectedCategories.map((category) => category.tag),
      theme: selectedThemes,
      access_policy: selectedAccessPolicy,
      allowed_groups: note.access_policy.allowed_groups || []
    };

    try {
      if (noteId) {
        await updateNote(noteId, input);
        navigate(`/notes/${noteId}`, { state: { message: "Notatet er oppdatert!" } });
      } else {
        await createNote(input);
        navigate("/myNotes", { state: { message: "Notatet er publisert!" } });
      }
      //Clear fields if no errors
      setTitle("");
      setOption("public");
      setText("");
      setSelectedSubject(null);
      setSelectedCategories([]);
      setResetKey(resetKey + 1);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f3f4f6",
        }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          backgroundColor: "#f3f4f6",
        }}>
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}>
          <>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "15px",
                fontFamily: "sans-serif",
              }}>
              {noteId ? "Rediger notat" : "Publiser et notat!"}
            </h2>
            <form
              onSubmit={onSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    fontFamily: "sans-serif",
                  }}>
                  Tittel
                </label>
                <TextField
                  type="text"
                  value={title}
                  error={!!titleError}
                  autoComplete="off"
                  helperText={titleError}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "5px",
                    fontFamily: "sans-serif",
                  }}
                  placeholder="Skriv inn tittel..."
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    fontFamily: "sans-serif",
                  }}>
                  Fag
                </label>
                <CourseSelector
                  key={resetKey}
                  onSubjectSelect={setSelectedSubject}
                  selectedSubject={selectedSubject}
                />
                {selectedSubjectError && (
                  <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                    {selectedSubjectError}
                  </p>
                )}
              </div>
              <div className="flex">
                <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>
                    Kategori
                  </label>
                  <div
                    style={{
                      borderRadius: "5px",
                      fontFamily: "sans-serif",
                      marginRight: "20px",
                      marginBottom: "10px",
                    }}>
                    <CategorySelector
                      key={resetKey}
                      onCategorySelect={setSelectedCategories}
                      selectedCategories={selectedCategories}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>
                    Tema
                  </label>
                  <ThemeField onThemeChange={setSelectedThemes} selectedThemes={selectedThemes} />
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    fontFamily: "sans-serif",
                  }}>
                  Tilgjengelighet
                </label>
                <select
                  value={option}
                  onChange={(e) => setOption(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontFamily: "sans-serif",
                  }}>
                  <option value="" style={{ fontFamily: "sans-serif" }}>
                    Velg...
                  </option>
                  <option value="private">Privat</option>
                  <option value="public">Offentlig</option>
                </select>
                {optionError && (
                  <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{optionError}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>
                  Notat
                </label>
                <ReactQuill
                  key={resetKey}
                  value={text}
                  onChange={setText}
                  style={{
                    backgroundColor: "white",
                    border: textError ? "1px solid red" : "1px solid #ccc",
                    borderRadius: "5px",
                    height: "200px",
                    overflow: "auto",
                  }}
                />
                {textError && (
                  <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{textError}</p>
                )}
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}>
                {noteId ? "Oppdater" : "Lag notat"}
              </button>
            </form>
          </>
        </div>
      </div>
    </>
  );
};

export default FormComponent;
