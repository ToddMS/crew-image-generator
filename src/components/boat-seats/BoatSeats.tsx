import { TextField, Stack } from "@mui/material";
import { getSeatLabel } from "../../services/BoatService";

interface BoatSeatsProps {
  boatType: string;
  names: string[];
  onNamesChange: (index: number, name: string) => void;
  hasSubmitted: boolean;
  hasCox: boolean;
}

const BoatSeats = ({ boatType, names, onNamesChange, hasSubmitted, hasCox }: BoatSeatsProps) => {
  return (
    <Stack spacing={2} alignItems="center">
      {names.reduce((rows: string[][], name, index) => {
        if (index % 4 === 0) rows.push([]);
        rows[rows.length - 1].push(name);
        return rows;
      }, []).map((rowSeats, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={2} justifyContent="center">
          {rowSeats.map((name, seatIndex) => {
            const globalIndex = rowIndex * 4 + seatIndex;
            const actualIndex = hasCox ? globalIndex + 1 : globalIndex; // Ensure correct numbering
            const seatLabel = getSeatLabel(boatType, actualIndex, names.length);

            return (
              <TextField
                key={globalIndex}
                label={seatLabel}
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
      ))}
    </Stack>
  );
};

export default BoatSeats;
