import { useState, FormEvent } from "react";
import { BoatType } from "../../types";
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
}

const RosterForm = ({ 
  selectedBoat, 
  names, 
  onNamesChange, 
  onSubmit
}: RosterFormProps) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const hasCox = selectedBoat.value.includes('+');
  const totalSeats = hasCox ? selectedBoat.seats + 1 : selectedBoat.seats;

  const allFieldsFilled = names.length === totalSeats && names.every((name) => name.trim());

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
    </form>
  );
};

export default RosterForm;
