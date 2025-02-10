import { TextField, Stack } from "@mui/material";
import { getSeatLabel } from "../../services/BoatService";

interface CrewRowProps {
  boatType: string;
  rowSeats: string[];
  rowIndex: number;
  onNamesChange: (index: number, name: string) => void;
  hasSubmitted: boolean;
}

const CrewRow = ({ boatType, rowSeats, rowIndex, onNamesChange, hasSubmitted }: CrewRowProps) => (
  <Stack direction="row" spacing={2} justifyContent="center">
    {rowSeats.map((name, seatIndex) => {
      const globalIndex = rowIndex * 4 + seatIndex; // Adjust index per row

      return (
        <TextField
          key={globalIndex}
          label={seatIndex === rowSeats.length - 1 ? "Bow" : getSeatLabel(boatType, globalIndex, rowSeats.length)}
          variant="outlined"
          value={name}
          onChange={(e) => onNamesChange(globalIndex, e.target.value)}
          error={hasSubmitted && !name.trim()}
          helperText={hasSubmitted && !name.trim() ? "Required" : ""}
          sx={{ width: "250px" }}
        />
      );
    })}
  </Stack>
);

export default CrewRow;
