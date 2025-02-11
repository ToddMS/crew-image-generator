import { SavedCrew } from "../types";
import SavedCrewItem from "./SavedCrewItem";
import { Typography, Box, Stack } from "@mui/material";
import "../styles/SavedCrewList.css";

interface SavedCrewsListProps {
  crews: SavedCrew[];
  onEdit: (crewId: string | null) => void;
  onDelete: (crewId: string) => void;
  currentlyEditing: string | null;
  onUpdateNames: (crewId: string, names: string[]) => void;
  onUpdateCrewName: (crewId: string, crewName: string) => void;
}

const SavedCrewsList = ({ 
  crews, 
  onEdit, 
  onDelete, 
  currentlyEditing, 
  onUpdateNames, 
  onUpdateCrewName 
}: SavedCrewsListProps) => {
  return (
    <Box className="saved-crews-container">
  <Box className="saved-crews-box">
    <Typography variant="h4" className="saved-crews-title">Saved Crews</Typography>
    {crews.length === 0 ? (
      <Typography variant="body1">No saved crews yet</Typography>
    ) : (
      <Stack className="saved-crews-stack">
        {crews.map((crew) => (
          <SavedCrewItem
            key={crew.id}
            crew={crew}
            currentlyEditing={currentlyEditing}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdateNames={onUpdateNames}
            onUpdateCrewName={onUpdateCrewName}
          />
        ))}
      </Stack>
    )}
  </Box>
</Box>
  );
};

export default SavedCrewsList;
