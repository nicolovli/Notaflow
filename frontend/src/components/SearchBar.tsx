import React, { useState, useEffect } from 'react';
import { Subject } from '../firebase/interfaces/interface.subject';
import debounce from 'lodash.debounce'; 

interface SearchBarProps {
  subjects: Subject[];
  onSearch: (filteredSubjects: Subject[], term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ subjects, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = debounce((term: string) => {
    const filtered = subjects.filter(subject =>
      subject.subject_code.toLowerCase().includes(term.toLowerCase()) ||
      subject.name.toLowerCase().includes(term.toLowerCase())
    );
    onSearch(filtered, term); 
  }, 300); 

  useEffect(() => {
    debouncedSearch(searchTerm);

   
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, subjects, debouncedSearch]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Søk etter fag"
        className="w-120 h-12 p-2 text-center pl-4 border rounded-2xl bg-[#D9D9D9] focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
    </div>
  );
};

export default SearchBar;