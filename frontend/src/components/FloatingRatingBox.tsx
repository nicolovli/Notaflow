import React, { useState } from "react";
import { Box, Button, Modal, Typography, Rating } from "@mui/material";

interface RatingPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (rating: number) => void;
    noteTitle: string;
}

const RatingPopup: React.FC<RatingPopupProps> = ({ open, onClose, onSave, noteTitle }) => {
    const [rating, setRating] = useState<number | null>(0);

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="rating-modal-title">
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "#ffffff",
                    p: 4,
                    borderRadius: 2,
                    textAlign: "center",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)"
                }}
            >
                <Typography id="rating-modal-title" variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                    Vurder {noteTitle}
                </Typography>
                <Rating
                    name="note-rating"
                    value={rating}
                    onChange={(event, newValue) => setRating(newValue)}
                    onMouseOver={(event) => event.currentTarget.style.cursor = "pointer"}
                    max={5}
                />
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        sx={{ bgcolor: "black", color: "white", "&:hover": { bgcolor: "#333" } }}
                        onClick={() => { if (rating) onSave(rating); onClose(); }}
                    >
                        Lagre
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default RatingPopup;
