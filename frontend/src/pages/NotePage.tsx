import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNote } from "../firebase/func/notes";
import { Note } from "../firebase/interfaces/interface.notes";
import { getSubject } from "../firebase/func/subject";
import { Subject } from "../firebase/interfaces/interface.subject";


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
        return <p>Loading note</p>
    } else if(error || note == null || subject == null) {
        return <p>Error occured</p>
    } else {
        console.log(note);
        return (
            <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 transition-all duration-200 hover:shadow-xl m-20 w-full">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{note.title}</h2>
            </div>
            
            <div className="flex items-center mt-2 space-x-2">
              <p className="text-sm text-gray-600">Fag: {subject.name} ({subject.subject_code})</p>
            </div>
      
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div 
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
          </div>
        )
    }
};

export default NotePage;
