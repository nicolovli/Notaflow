import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNote } from "../firebase/func/notes";
import { Note } from "../firebase/interfaces/interface.notes";
import { getSubject } from "../firebase/func/subject";
import { Subject } from "../firebase/interfaces/interface.subject";
import { CircularProgress, Alert } from "@mui/material";
import "../assets/style.css";


export const NotePage: React.FC = () => {
    const { id } = useParams(); 
  
    const [note, setNote] = useState<Note | null>(null);
    const [isLoading, setisLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subject, setSubject] = useState<Subject | null>(null);
    
    useEffect(() => {
      const fetchAll = async () => {
        try {
          if (id == undefined) { 
            throw new Error("ID not set correctly");  
          } else {
            const note = await getNote(id);
            setNote(note);
            if(note == null) {
                throw new Error("Error with note");
            }
            const subject = await getSubject(note.subject_id);
            setSubject(subject);
          }
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
        } finally {
          setisLoading(false);
        }
      };


      fetchAll();
    }, [id]);
  

    if (isLoading) { 
      <div className="flex justify-center items-start min-h-screen bg-white p-10">
        <CircularProgress />
        </div>
    } else if(error || note == null || subject == null) {
        return <Alert variant="filled" severity="error">
                An error occured. Check you network connection
              </Alert>
    } else {
        return (
          <div className="flex justify-center items-start min-h-screen bg-white p-10">
            <div className="max-w-3xl w-full bg-white rounded-lg p-8 font-sans">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{note.title}</h1>
                <p className="text-lg text-gray-700 font-medium border-b pb-4 mb-4">{subject.name} ({subject.subject_code})</p>
                <br></br>
                <div id="content" className="prose prose-lg text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: note.content }} />
            </div>
        </div>
        )
    }
};

export default NotePage;
