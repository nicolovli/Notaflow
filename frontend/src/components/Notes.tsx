import React, { useEffect, useState } from "react";

const dummyNotes = [
  {
    id: "1",
    title: "Introduksjon til Matematikk",
    subject_id: "Matematikk 101",
    access_policy: "Offentlig",
    content: "<p>Dette er en introduksjon til matematikk. Her vil vi lære om algebra, geometri og mer.</p>"
  },
  {
    id: "2",
    title: "Grunnleggende Fysikk",
    subject_id: "Fysikk 102",
    access_policy: "Privat",
    content: "<p>I dette notatet diskuterer vi Newtons lover og kinematikk.</p>"
  },
  {
    id: "3",
    title: "Programmering i JavaScript",
    subject_id: "Informatikk 201",
    access_policy: "Gruppe",
    content: "<p>Her lærer vi grunnleggende JavaScript og hvordan vi bruker funksjoner.</p>"
  }
];

const NotesDisplay = () => {
  const [notes, setNotes] = useState(dummyNotes);

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-6 text-center">Dine Notater</h1>
      {notes.length > 0 ? (
        notes.map((note) => (
          <div key={note.id} className="bg-white shadow-lg rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold">{note.title}</h2>
            <p className="text-gray-600 text-sm">Fag: {note.subject_id} | Tilgjengelighet: {note.access_policy}</p>
            <div className="mt-4 border-t pt-3" dangerouslySetInnerHTML={{ __html: note.content }} />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">Ingen notater funnet.</p>
      )}
    </div>
  );
};

export default NotesDisplay;