import { useState, useEffect, FormEvent } from "react";
import { SavedCrew } from "../../types/index";
import { getSeatLabel } from "../../services/BoatService";
import ErrorPopup from "../errors/ErrorPopup";
import { Typography, Box, Stack, TextField, Button, Paper } from "@mui/material";

interface EditCrewFormProps {
  crew: SavedCrew;
  onUpdateNames: (crewId: string, names: string[]) => void;
  onUpdateCrewName: (crewId: string, crewName: string) => void;
  onCancel: () => void;
}

const EditCrewForm = ({ crew, onUpdateNames, onCancel }: EditCrewFormProps) => {
  const [crewMembers, setCrewMembers] = useState([...crew.crewNames]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setCrewMembers([...crew.crewNames]);
  }, [crew.crewNames]);

  const validateForm = () => {
    return crewMembers.every(name => name.trim() !== "");
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowErrors(true);

    if (validateForm()) {
      onUpdateNames(crew.id, crewMembers);
      onCancel();
    } else {
      setShowErrorPopup(true);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <form onSubmit={handleFormSubmit}>
        <Typography variant="h5" gutterBottom>Edit Crew</Typography>
        <Typography variant="h6">Crew Members:</Typography>
        <Stack spacing={2}>
          {crewMembers.map((name, index) => (
            <TextField
              key={index}
              label={getSeatLabel(crew.boatType.value, index, crewMembers.length)}
              value={name}
              onChange={(e) => {
                const updatedNames = [...crewMembers];
                updatedNames[index] = e.target.value;
                setCrewMembers(updatedNames);
              }}
              error={showErrors && !name.trim()}
              helperText={showErrors && !name.trim() ? "This field is required" : ""}
              fullWidth
            />
          ))}
        </Stack>
        <Box mt={2} display="flex" gap={2}>
          <Button type="submit" variant="contained" color="primary">Save</Button>
          <Button variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>
        </Box>
        <ErrorPopup message="Please fill in all fields before saving." visible={showErrorPopup} onClose={() => setShowErrorPopup(false)} />
      </form>
    </Paper>
  );
};

export default EditCrewForm;
