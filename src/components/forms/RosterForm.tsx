import { useState, FormEvent } from "react";
import { BoatType } from "../../types/crew.types";
import { Button, Typography, Box } from "@mui/material";
import BoatSeats from "../boat-seats/BoatSeats";
import '../../styles/forms/RosterForm.css';

interface RosterFormProps {
  selectedBoat: BoatType;
  names: string[];
  onNamesChange: (names: string[]) => void;
  onSubmit: () => void;
  clubName: string;
  raceName: string;
  crewName: string;
  selectedCrewId?: string;
}

const RosterForm = ({ 
  selectedBoat, 
  names, 
  onNamesChange, 
  onSubmit, 
  selectedCrewId
}: RosterFormProps) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const hasCox = selectedBoat.value.includes('+');
  const totalSeats = hasCox ? selectedBoat.seats + 1 : selectedBoat.seats;
  const allFieldsFilled = names.length === totalSeats && names.every((name) => name.trim());

  const handleGenerateImage = async () => {
    if (!selectedCrewId) {
      console.error("No crew selected!");
      return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/crews/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crewId: selectedCrewId }),
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

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!allFieldsFilled) {
      setHasSubmitted(true);
      return;
    }
  
    setHasSubmitted(false);
    onSubmit();
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    onNamesChange(newNames);

    if (hasSubmitted) {
      setHasSubmitted(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="roster-form">
      <Typography variant="h4" gutterBottom>
        Enter crew names for {selectedBoat.name}
      </Typography>

      <BoatSeats 
        boatType={selectedBoat.value} 
        names={names}
        onNamesChange={handleNameChange} 
        hasSubmitted={hasSubmitted} 
      />

      <Box mt={3}>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={!allFieldsFilled}
        >
          Submit Roster
        </Button>
      </Box>

      {selectedCrewId && (
        <Box mt={3}>
          <Button 
            variant="contained"
            color="secondary"
            onClick={handleGenerateImage}
          >
            Generate Crew Image
          </Button>
        </Box>
      )}

      {imageSrc && (
        <Box mt={3}>
          <Typography variant="h5">Generated Crew Image:</Typography>
          <img src={imageSrc} alt="Crew Image" style={{ width: "100%", maxWidth: "500px" }} />
        </Box>
      )}
    </form>
  );
};

export default RosterForm;
