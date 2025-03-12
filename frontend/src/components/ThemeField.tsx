import { TextField } from "@mui/material";
import React, { useState } from "react";

interface ThemeFieldProps {
    onThemeChange: (themes: string[]) => void;
    selectedThemes: string[];
}
const ThemeField: React.FC<ThemeFieldProps> = ({ onThemeChange, selectedThemes }) => {
    const [themeInput, setThemeInput] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && themeInput.trim()) {
            e.preventDefault();
            if (!selectedThemes.includes(themeInput.trim())) {
                onThemeChange([...selectedThemes, themeInput.trim()]);
            }
            setThemeInput("");
        }
    };

    const removeTheme = (theme: string) => {
        onThemeChange(selectedThemes.filter((t) => t !== theme));
    };

    return (
        <div className="w-full">
            <TextField
                fullWidth
                variant="outlined"
                value={themeInput}
                placeholder="Skriv tema og trykk enter"
                autoComplete="off"
                onChange={(e) => setThemeInput(e.target.value)}
                onKeyDown={handleKeyDown}
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

            <div className="mt-2 flex flex-wrap gap-2">
                {selectedThemes.map((theme) => (
                    <span
                        key={theme}
                        onClick={() => removeTheme(theme)}
                        style={{
                            background: "#007BFF",
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        {theme} X

                    </span>
                ))}
            </div>
        </div>
    );
};
export default ThemeField;