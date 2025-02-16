import { SavedCrew } from "../types";
import { getSeatLabel } from "../utils/BoatUtils";
import { Typography, Box, Paper, Stack, Button } from "@mui/material";

interface SavedCrewItemProps {
  crew: SavedCrew;
  currentlyEditing: string | null;
  onEdit: (crewId: string | null) => void;
  onDelete: (crewId: string) => void;
}

const SavedCrewItem = ({ crew, currentlyEditing, onEdit, onDelete }: SavedCrewItemProps) => {
  console.log("Rendering crew:", crew);

  if (!crew || !crew.boatType || !crew.boatType.seats) {
    return <Typography color="error">Error: Invalid crew data</Typography>;
  }

  const numberOfRowers = crew.boatType.seats;

  return (
    <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography variant="h6">{crew.clubName}</Typography>
          <Typography variant="subtitle1">{crew.raceName}</Typography>
          <Typography variant="subtitle1">
            {crew.name} - {crew.boatType.value}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={() => onEdit(crew.id)} disabled={currentlyEditing === crew.id}>
            Edit
          </Button>
          <Button variant="contained" color="error" onClick={() => onDelete(crew.id)} disabled={currentlyEditing === crew.id}>
            Delete
          </Button>
        </Stack>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Crew Members:
        </Typography>
        <Stack spacing={1}>
          {crew.crewNames.map((name, index) => (
            <Typography key={index} variant="body2">
              <strong>{getSeatLabel(crew.boatType.value, index, numberOfRowers)}:</strong> {name}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default SavedCrewItem;
