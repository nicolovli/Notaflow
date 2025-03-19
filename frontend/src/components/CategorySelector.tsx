import React, { useState, useEffect, useRef } from "react";
import { Category } from "../firebase/interfaces/interface.category";
import { getAllCategory } from "../firebase/func/category";
import { Alert, Box, TextField } from "@mui/material";
import { Paper } from "@mui/material";

interface CourseCategoryProps {
  onCategorySelect: (category: Category[]) => void;
  selectedCategories: Category[];
  initialValue?: string;
}

const CourseSelector: React.FC<CourseCategoryProps> = ({
  onCategorySelect,
  selectedCategories,
  initialValue = "",
}) => {
  const [category, setCategory] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getAllCategory();
        setCategory(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch category");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, []);

  useEffect(() => {
    if (selectedCategories && !isOpen) {
      setSearchTerm("");
    }
  }, [selectedCategories, isOpen]);

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

  const filteredCategory = category.filter((category) => {
    const formattedSearchTerm = searchTerm.toLowerCase().trim();
    return (
      category.tag.toLowerCase().includes(formattedSearchTerm) ||
      `${category.tag}`.toLowerCase().includes(formattedSearchTerm)
    );
  });

  const handleSelect = (category: Category) => {
    setIsOpen(false);
    setSearchTerm("");
    // onCategorySelect(category);
    const isAlreadySelected = selectedCategories.some((c) => c.id === category.id);
    if (isAlreadySelected) {
      // Deselect category
      onCategorySelect(selectedCategories.filter((c) => c.id !== category.id));
    } else {
      // Select category
      onCategorySelect([...selectedCategories, category]);
    }
  };

  return (
    <Box className="relative w-full">
      <Box className="relative">
        <TextField
          fullWidth
          variant="outlined"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onCategorySelect([]);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Velg et kategori"
          autoComplete="off"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "5px",
            },
            "& .MuiInputBase-input": {
              padding: "10px",
            },
            marginBottom: "10px",
          }}
        />
      </Box>

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
            backgroundColor: "background.paper",
            color: "text.primary",
            borderRadius: "5px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            maxHeight: "300px",
            overflowY: "auto",
            marginTop: "5px",
            padding: "10px",
            textAlign: "center",
          }}>
          {filteredCategory.length === 0 ? (
            <div className="p-2 text-gray-500">No category found</div>
          ) : (
            <ul>
              {filteredCategory.map((category) => (
                <li
                  key={category.id}
                  onClick={() => handleSelect(category)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}>
                  <span className="font-medium">{category.tag}</span>
                </li>
              ))}
            </ul>
          )}
        </Paper>
      )}

      {/* Display selected categories */}
      <div className="mt-2">
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <span
                key={cat.id}
                style={{
                  background: "#007BFF",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => handleSelect(cat)}>
                {cat.tag} <span style={{ marginLeft: "5px" }}>×</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </Box>
  );
};

export default CourseSelector;
