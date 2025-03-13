import React, { useState, useEffect } from 'react';
// import { Subject } from '../firebase/interfaces/interface.subject';
import debounce from 'lodash.debounce'; 

interface SearchBarProps<T> {
  data: T[];
  onSearch: (filteredSubjects: T[], term: string) => void;
  filterFunction: (item: T, term: string) => boolean;
  placeholder?: string;
}

const SearchBar = <T,>({ data, onSearch, filterFunction, placeholder}: SearchBarProps<T>): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = debounce((term: string) => {
    const filtered = data.filter(item =>
      filterFunction(item, term));
      onSearch(filtered, term); 
  }, 300); 

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, data, debouncedSearch]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder || "Søk..."}
        className="w-120 h-12 p-2 text-center pl-4 border rounded-2xl bg-[#D9D9D9] focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
    </div>
  );
};

export default SearchBar;