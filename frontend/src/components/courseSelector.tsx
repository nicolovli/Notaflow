import React, { useState, useEffect, useRef } from "react";
import { Subject } from "../firebase/interfaces/interface.subject";
import { getAllSubjects } from "../firebase/func/subject";
import { Alert, Paper, TextField } from "@mui/material";

interface CourseSelectorProps {
  onSubjectSelect: (subject: Subject | null) => void;
  selectedSubject: Subject | null;
  initialValue?: string;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  onSubjectSelect,
  selectedSubject,
  initialValue = "",
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getAllSubjects();
        setSubjects(response);
        // console.log(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch subjects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject && !isOpen) {
      setSearchTerm(`${selectedSubject.subject_code} - ${selectedSubject.name}`);
    }
  }, [selectedSubject, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredSubjects = subjects.filter((subject) => {
    const formattedSearchTerm = searchTerm.toLowerCase().trim();
    return (
      subject.subject_code.toLowerCase().includes(formattedSearchTerm) ||
      subject.name.toLowerCase().includes(formattedSearchTerm) ||
      `${subject.subject_code} - ${subject.name}`.toLowerCase().includes(formattedSearchTerm)
    );
  });

  const handleSelect = (subject: Subject) => {
    setIsOpen(false);
    setSearchTerm(`${subject.subject_code} - ${subject.name}`);
    onSubjectSelect(subject);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <TextField
          fullWidth
          variant="outlined"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onSubjectSelect(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Søk på et fag (F.eks., CS101)"
          autoComplete="off"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "5px",
            },
            "& .MuiInputBase-input": {
              padding: "10px",
            },
          }}
        />
      </div>

      {error && (
        <Alert variant="filled" severity="error" style={{ marginTop: "10px" }}>
          En feil oppstod. Sjekk nettverket ditt.
        </Alert>
      )}

      {!isLoading && isOpen && (
        <Paper
          ref={dropdownRef}
          style={{
            position: "absolute",
            zIndex: 10,
            width: "100%",
            borderRadius: "5px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            maxHeight: "300px",
            overflowY: "auto",
            marginTop: "5px",
            padding: "10px",
            textAlign: "center",
          }}>
          {filteredSubjects.length === 0 ? (
            <div className="p-2">No subjects found</div>
          ) : (
            <ul>
              {filteredSubjects.map((subject) => (
                <li
                  key={subject.id}
                  onClick={() => handleSelect(subject)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}>
                  <span className="font-medium">{subject.subject_code}</span>
                  <span className="ml-2"> - {subject.name}</span>
                </li>
              ))}
            </ul>
          )}
        </Paper>
      )}
    </div>
  );
};

export default CourseSelector;
