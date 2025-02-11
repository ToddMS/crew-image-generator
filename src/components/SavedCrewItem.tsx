import { useState } from "react";
import { SavedCrew } from "../types";
import { getSeatLabel } from "../services/BoatService";
import EditCrewForm from "./forms/EditCrewForm";
import { Typography, Box, Paper, Stack, Button } from "@mui/material";

interface SavedCrewItemProps {
  crew: SavedCrew;
  currentlyEditing: string | null;
  onEdit: (crewId: string | null) => void;
  onDelete: (crewId: string) => void;
  onUpdateNames: (crewId: string, names: string[]) => void;
  onUpdateCrewName: (crewId: string, crewName: string) => void;
}

const SavedCrewItem = ({
  crew,
  currentlyEditing,
  onEdit,
  onDelete,
  onUpdateNames,
  onUpdateCrewName,
}: SavedCrewItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpansion = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "BUTTON") return;

    if (isExpanded) {
      onEdit(null);
    }

    setIsExpanded(!isExpanded);
  };

  return (
    <Paper elevation={3} sx={{ padding: 2 }} onClick={handleToggleExpansion}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography variant="h6">{crew.clubName}</Typography>
          <Typography variant="subtitle1">{crew.raceName}</Typography>
          <Typography variant="subtitle1">{crew.name} - {crew.boatType.value}</Typography>
        </Stack>
        <Button
          variant="contained"
          color="error"
          onClick={(e) => { e.stopPropagation(); onDelete(crew.id); }}
          disabled={currentlyEditing === crew.id}
        >
          Delete
        </Button>
      </Box>

      {isExpanded && (
        <Box mt={2} onClick={(e) => e.stopPropagation()}>
          {currentlyEditing === crew.id ? (
            <EditCrewForm
              crew={crew}
              onUpdateNames={onUpdateNames}
              onUpdateCrewName={onUpdateCrewName}
              onCancel={() => onEdit(null)}
            />
          ) : (
            <>
              <Typography variant="subtitle2">Crew Members:</Typography>
              {crew.crewNames.map((name, index) => (
                <Typography key={index}>
                  <strong>{getSeatLabel(crew.boatType.value, index, crew.crewNames.length)}:</strong> {name}
                </Typography>
              ))}
              <Button variant="contained" color="primary" onClick={(e) => { e.stopPropagation(); onEdit(crew.id); }}>
                Edit Crew
              </Button>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SavedCrewItem;
