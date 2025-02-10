import { useState, FormEvent } from "react";
import { BoatType } from "../../types/index";
import "../../styles/forms/RosterForm.css";
import { Button, Typography, Box, Stack } from "@mui/material";
import CoxswainField from "../boat-seats/CoxswainField";
import CrewRow from "../boat-seats/CrewRow";
import SingleScullField from "../boat-seats/SingleScullField"; // New component for single rowers

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

  const isEight = selectedBoat.seats === 9; 
  const isFour = selectedBoat.seats === 5 || selectedBoat.seats === 4;
  const isTwo = selectedBoat.seats === 2;
  const isSingle = selectedBoat.seats === 1;

  const hasCox = selectedBoat.seats > 1 && selectedBoat.seats % 2 !== 0;

  // Function to update crew member names
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

          {isEight && (
            <Stack spacing={2}>
              <CrewRow boatType={selectedBoat.value} rowSeats={names.slice(1, 5)} rowIndex={0} onNamesChange={handleNameChange} hasSubmitted={hasSubmitted} />
              <CrewRow boatType={selectedBoat.value} rowSeats={names.slice(5, 9)} rowIndex={1} onNamesChange={handleNameChange} hasSubmitted={hasSubmitted} />
            </Stack>
          )}

          {isFour && <CrewRow boatType={selectedBoat.value} rowSeats={names.slice(1, 5)} rowIndex={0} onNamesChange={handleNameChange} hasSubmitted={hasSubmitted} />}

          {isTwo && <CrewRow boatType={selectedBoat.value} rowSeats={names} rowIndex={0} onNamesChange={handleNameChange} hasSubmitted={hasSubmitted} />}

          {isSingle && (
            <SingleScullField name={names[0]} onNameChange={(name) => handleNameChange(0, name)} hasSubmitted={hasSubmitted} />
          )}
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
