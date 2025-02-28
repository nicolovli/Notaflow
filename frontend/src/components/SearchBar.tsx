import React, { useState, useEffect } from 'react';
import { Subject } from '../firebase/interfaces/interface.subject';
import debounce from 'lodash.debounce'; // Import debounce from lodash

interface SearchBarProps {
  subjects: Subject[];
  onSearch: (filteredSubjects: Subject[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ subjects, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce the search function
  const debouncedSearch = debounce((term: string) => {
    const filtered = subjects.filter(subject =>
      subject.subject_code.toLowerCase().includes(term.toLowerCase()) ||
      subject.name.toLowerCase().includes(term.toLowerCase())
    );
    onSearch(filtered); // Pass the filtered list to the parent component
  }, 300); // 300ms delay

  useEffect(() => {
    debouncedSearch(searchTerm); // Trigger debounced search when searchTerm changes

    // Cleanup debounce on unmount
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
        placeholder="Søk på fag"
        className="w-80 h-10 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default SearchBar;