import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';
import { createNote } from "../firebase/func/notes";
import { CreateNoteInput } from "../firebase/interfaces/interface.notes";
import { auth } from "../Config/firebase-config";
import { stringToAccessPolicyType } from "../firebase/interfaces/interface.notes";
import CourseSelector from "./courseSelector";
import { Subject } from "../firebase/interfaces/interface.subject";


 
const FormComponent = () => {
  const [title, setTitle] = useState("");
  const [option, setOption] = useState("");
  const [text, setText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, option, selectedSubject, text });

  };

  const onSubmit = () => {
    console.log(selectedSubject)
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

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <div style={{ width: "100%", maxWidth: "600px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px", fontFamily: "sans-serif"}}>Publiser et notat!</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", fontFamily: "sans-serif" }}>Tittel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "5px", fontFamily: "sans-serif" }}
              placeholder="Skriv inn tittel..."
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", fontFamily: "sans-serif" }}>Fag</label>
            <CourseSelector onSubjectSelect={handleSubjectSelect}/>
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
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>Notat</label>
            <ReactQuill value={text} onChange={setText} style={{ backgroundColor: "white" }} />
          </div>

          <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={onSubmit}>
            Send inn
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormComponent;
