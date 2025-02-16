import { TextField, Stack } from "@mui/material";
import { getSeatLabel } from "../../utils/BoatUtils";

interface BoatSeatsProps {
  boatType: string;
  names: string[];
  onNamesChange: (index: number, name: string) => void;
  hasSubmitted: boolean;
}

const BoatSeats = ({ boatType, names, onNamesChange, hasSubmitted }: BoatSeatsProps) => {
  const hasCox = boatType.includes('+');
  const numberOfRowers = parseInt(boatType.charAt(0));

  const rowerIndexes = hasCox 
    ? Array.from({ length: numberOfRowers }, (_, i) => i + 1)
    : Array.from({ length: numberOfRowers }, (_, i) => i);

  const rows = rowerIndexes.reduce((acc: number[][], curr, index) => {
    if (index % 4 === 0) acc.push([]);
    acc[acc.length - 1].push(curr);
    return acc;
  }, []);

  return (
    <Stack spacing={2} alignItems="center">
      {hasCox && (
        <Stack direction="row" justifyContent="center" mb={2}>
          <TextField
            key={0}
            label={getSeatLabel(boatType, 0, numberOfRowers)}
            variant="outlined"
            value={names[0] || ''}
            onChange={(e) => onNamesChange(0, e.target.value)}
            error={hasSubmitted && !names[0]?.trim()}
            helperText={hasSubmitted && !names[0]?.trim() ? "Required" : ""}
            sx={{ 
              width: "250px",
            }}
          />
        </Stack>
      )}

      {rows.map((rowIndexes, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={2} justifyContent="center">
          {rowIndexes.map((seatIndex) => {
            const seatLabel = getSeatLabel(boatType, seatIndex, numberOfRowers);
            
            return (
              <TextField
                key={seatIndex}
                label={seatLabel}
                variant="outlined"
                value={names[seatIndex] || ''}
                onChange={(e) => onNamesChange(seatIndex, e.target.value)}
                error={hasSubmitted && !names[seatIndex]?.trim()}
                helperText={hasSubmitted && !names[seatIndex]?.trim() ? "Required" : ""}
                sx={{ 
                  width: "250px"
                }}
              />
            );
          })}
        </Stack>
      ))}
    </Stack>
  );
};

export default BoatSeats;