import React, { useState } from "react";
import { Box, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";

interface FilterBoxProps {
  tags: string[];
  themes: string[];
  onFilter: (selectedTags: string[], selectedThemes: string[]) => void;
  onReset: () => void;
}

const FilterBox: React.FC<FilterBoxProps> = ({ tags, themes, onFilter, onReset }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>("");

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const newTags = event.target.value as string[];
    setSelectedTags(newTags);
    onFilter(newTags, [selectedTheme]); 
  };

  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    const newTheme = event.target.value as string;
    setSelectedTheme(newTheme);
    onFilter(selectedTags, [newTheme]); 
  };

  const handleReset = () => {
    console.log("Resetting filters"); // Debugging
    setSelectedTags([]);
    setSelectedTheme("");
    onReset();
  };

  console.log("FilterBox re-rendered"); // Debugging

  return (
    <Box sx={{ mb: 5, textAlign: "center"}}>
      <FormControl sx={{ m: 1, minWidth: 180 }}>
        <InputLabel>Kategori</InputLabel>
        <Select multiple value={selectedTags} onChange={handleTagChange} label="Tags">
          {tags.map((tag) => (
            <MenuItem key={tag} value={tag}>
              {tag}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ m: 1, minWidth: 140}}>
        <InputLabel>Tema</InputLabel>
        <Select value={selectedTheme} onChange={handleThemeChange} label="Themes">
          <MenuItem value="">None</MenuItem>
          {themes.map((theme) => (
            <MenuItem key={theme} value={theme}>
              {theme}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <p onClick={handleReset} className="text-gray-700 cursor-pointer underline text-lg">
        Nullstill
      </p>
    </Box>
  );
};

export default FilterBox;
