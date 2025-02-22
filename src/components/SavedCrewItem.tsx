import { useCrewContext } from "../context/CrewContext";
import { Crew } from "../types/crew.types";
import { Typography, Box, Paper, Stack, Button } from "@mui/material";
import { getSeatLabel } from "../utils/BoatUtils";

interface SavedCrewItemProps {
  crew: Crew;
}

const SavedCrewItem = ({ crew }: SavedCrewItemProps) => {
  const { deleteCrew, editCrew } = useCrewContext();

  console.log(crew)

  if (!crew || !crew.boatType || !crew.boatType.seats) {
    return <Typography color="error">Error: Invalid crew data</Typography>;
  }

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
          <Button variant="contained" color="primary" onClick={() => editCrew(crew.id)}>
            Edit
          </Button>
          <Button variant="contained" color="error" onClick={() => deleteCrew(crew.id)}>
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
              <strong>{getSeatLabel(crew.boatType.value, index, crew.boatType.seats)}:</strong> {name}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default SavedCrewItem;
