import { useCrewContext } from "../context/CrewContext";
import { Crew } from "../types/crew.types";
import { Typography, Box, Button, Stack } from "@mui/material";
import { getSeatLabel } from "../utils/BoatUtils";
import "../styles/SavedCrewItem.css";
import { forwardRef } from "react";

interface SavedCrewItemProps {
  crew: Crew;
}

const SavedCrewItem = forwardRef<HTMLDivElement, SavedCrewItemProps>(({ crew }, ref) => {
  const { deleteCrew, setEditingCrew } = useCrewContext();

  return (
    <Box 
      ref={ref}
      className="crew-item"
      style={{ height: `${80 + crew.crewNames.length * 20}px` }}
    >
      <Typography variant="h6" className="crew-title">
      {crew.name} ({crew.boatType.value})
      </Typography>

      <Box className="crew-members">
        {crew.crewNames.map((name, index) => (
          <Typography key={index} variant="body2" className="crew-member">
            {getSeatLabel(crew.boatType.value, index, crew.boatType.seats)}: {name}
          </Typography>
        ))}
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center">
        <Button 
          size="small" 
          variant="contained" 
          color="primary" 
          onClick={() => setEditingCrew(crew)}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          variant="contained" 
          color="error" 
          onClick={() => deleteCrew(crew.id)}
        >
          Delete
        </Button>
      </Stack>
    </Box>
  );
});

export default SavedCrewItem;
