import { useState, FormEvent } from "react";
import { BoatType } from "../../types/index";
import "../../styles/forms/RosterForm.css";
import { Button, Typography, Box, Stack } from "@mui/material";
import CoxswainField from "../boat-seats/CoxswainField";
import BoatSeats from "../boat-seats/BoatSeats";

interface RosterFormProps {
  selectedBoat: BoatType;
  names: string[];
  onNamesChange: (names: string[]) => void;
  onSubmit: () => void;
}

const RosterForm = ({ selectedBoat, names, onNamesChange, onSubmit }: RosterFormProps) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const allFieldsFilled = names.every((name) => name.trim());

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (allFieldsFilled) {
      onSubmit();
    }
  };

  const hasCox = selectedBoat.seats > 1 && selectedBoat.seats % 2 !== 0;

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    onNamesChange(newNames);
  };

  return (
    <form onSubmit={handleFormSubmit} className="roster-form">
      <Typography variant="h4" className="roster-title">Enter Crew Names</Typography>

      <Box className="roster-grid">
        <Stack spacing={2} alignItems="center">
          {hasCox && <CoxswainField name={names[0]} onNameChange={(name) => handleNameChange(0, name)} hasSubmitted={hasSubmitted} />}
          
          <BoatSeats 
            boatType={selectedBoat.value} 
            names={hasCox ? names.slice(1) : names} 
            onNamesChange={(index, name) => handleNameChange(hasCox ? index + 1 : index, name)} 
            hasSubmitted={hasSubmitted} 
            hasCox={hasCox} 
          />
        </Stack>
      </Box>

      <div className="button-container">
        <Button type="submit" variant="contained" color="primary">
          Submit Roster
        </Button>
      </div>
    </form>
  );
};

export default RosterForm;
