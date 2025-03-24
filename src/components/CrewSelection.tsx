import { useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { Crew } from "../types/crew.types";

const CrewSelection = () => {
  const [selectedCrew] = useState<Crew | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);


  const handleGenerateImage = async () => {
    if (!selectedCrew) {
      console.error("No crew selected!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/crews/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crewId: selectedCrew.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageSrc(imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  return (
    <Box>
      {selectedCrew && (
        <Typography variant="h6">
          Selected Crew: {selectedCrew.name} ({selectedCrew.boatType.value})
        </Typography>
      )}

      {selectedCrew && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleGenerateImage}
          sx={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 20px",
            fontSize: "16px",
          }}
        >
          Generate Crew Image
        </Button>
      )}

      {imageSrc && (
        <Box mt={3}>
          <Typography variant="h5">Generated Crew Image:</Typography>
          <img src={imageSrc} alt="Crew Image" style={{ width: "100%", maxWidth: "500px" }} />
        </Box>
      )}
    </Box>
  );
};

export default CrewSelection;
