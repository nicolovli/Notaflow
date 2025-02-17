import React, {useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';
import { createNote } from "../firebase/func/notes";
import { CreateNoteInput } from "../firebase/interfaces/interface.notes";
import { auth } from "../Config/firebase-config";
import { stringToAccessPolicyType } from "../firebase/interfaces/interface.notes";
import CourseSelector from "./courseSelector";
import { Subject } from "../firebase/interfaces/interface.subject";
import { TextField, Alert } from "@mui/material";


 
const FormComponent = () => {
  const [title, setTitle] = useState("");
  const [option, setOption] = useState("");
  const [text, setText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  //Error fields
  const [titleError, setTitleError] = useState<string | null>(null);
  const [optionError, setOptionError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const [selectedSubjectError, setSelectedSubjectError] = useState<string | null>(null);

  // Success feedback state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, option, selectedSubject, text });

  };

  //Send in form 
  const onSubmit = () => {
    console.log(selectedSubject)
    
    setOptionError(null);
    setSelectedSubjectError(null);
    setTitleError(null);
    setTextError(null);
    
    //Error handling
    let hasError = false;

    if (title.trim().length === 0) {
      setTitleError("Du må skrive inn en tittel for notatet");
      hasError = true;
    } 
  
    if (text.trim().length < 20) {
      setTextError("Du må skrive inn tekst i notatet. Må være på minst 20 tegn.");
      hasError = true;
    }

    if (!selectedSubject) {
      setSelectedSubjectError("Du må velge et fag");
      hasError = true;
    }

    if (!option) {
      setOptionError("Du må velge en tilgjengelighet");
      hasError = true;
    }
  
    //Don´t continoue if there is errors
    if (hasError) {
      return
    }

    //Clear fields if no errors
    setSuccessMessage("Notatet har blitt publisert");
    setTitle("");
    setOption("");
    setText("");
    setSelectedSubject(null);


    //Create input
    const input: CreateNoteInput = {
      user_id: auth.currentUser?.uid ?? "unkown user",
      subject_id: selectedSubject?.id ?? "empty" ,
      title: title,
      content: text,
      access_policy: stringToAccessPolicyType(option)
      
  }
  createNote(input)
  
  }

  const handleSubjectSelect = (subject: Subject | null) => {
    setSelectedSubject(subject);
  }

  //The success message disapear after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  

  return (
    <>
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <div style={{ width: "100%", maxWidth: "600px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px", fontFamily: "sans-serif"}}>Publiser et notat!</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", fontFamily: "sans-serif" }}>Tittel</label>
            <TextField
              type="text"
              value={title}
              error = {!!titleError}
              helperText = {titleError}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "8px",  borderRadius: "5px", fontFamily: "sans-serif" }}
              placeholder="Skriv inn tittel..."
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", fontFamily: "sans-serif" }}>Fag</label>
              <CourseSelector onSubjectSelect={handleSubjectSelect} />
              {selectedSubjectError && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{selectedSubjectError}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", fontFamily: "sans-serif" }}>Tilgjengelighet</label>
            <select
              value={option}
              onChange={(e) => setOption(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "5px", fontFamily: "sans-serif" }}
            >
              <option value="" style={{fontFamily: "sans-serif"}}>Velg...</option>
              <option value="private">Privat</option>
              <option value="group">Gruppe</option>
              <option value="public">Offentlig</option>
            </select>
            {optionError && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{optionError}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>Notat</label>
            <ReactQuill value={text} onChange={setText}  style={{ backgroundColor: "white", border: textError ? "1px solid red" : "1px solid #ccc", borderRadius: "5px" }}  />
            {textError && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{textError}</p>}
          </div>

          <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={onSubmit}>
            Send inn
          </button>

      
          {successMessage && <Alert severity={"success"}>{successMessage}</Alert>}
        </form>
      </div>
    </div>
    </>
  );
};

export default FormComponent;
