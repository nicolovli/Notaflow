import React, { useState, useEffect } from 'react';
import { Subject } from '../firebase/interfaces/interface.subject'
import { getAllSubjects } from '../firebase/func/subject'

interface CourseSelectorProps {
  onSubjectSelect: (subject: Subject | null) => void;
  initialValue?: string;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ 
  onSubjectSelect, 
  initialValue = "" 
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getAllSubjects();
        setSubjects(response); 
        console.log(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter(subject =>
    subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (subject: Subject) => {
    setSearchTerm(subject.subject_code);
    onSubjectSelect(subject);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onSubjectSelect(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a subject (e.g., CS101)"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Loading subjects...</div>
          ) : error ? (
            <div className="p-2 text-red-500">{error}</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="p-2 text-gray-500">No subjects found</div>
          ) : (
            <ul>
              {filteredSubjects.map((subject) => (
                <li
                  key={subject.id}
                  onClick={() => handleSelect(subject)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <span className="font-medium">{subject.subject_code}</span>
                  <span className="ml-2 text-gray-600">- {subject.name}</span>
                  
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseSelector;