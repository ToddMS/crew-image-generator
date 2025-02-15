import { useState, FormEvent } from "react";
import { BoatType } from "../../types";
import "../../styles/forms/RaceForm.css";
import { TextField, Typography, Button, MenuItem, Select, FormControl, InputLabel, Box } from "@mui/material";

interface RaceFormProps {
  boatClass: BoatType[];
  onFormSubmit: (club: string, race: string, boat: string, selectedBoat: BoatType) => void;
}

const RaceForm = ({ boatClass, onFormSubmit }: RaceFormProps) => {
  const [clubName, setClubName] = useState("Auriol Kensington");
  const [raceName, setRaceName] = useState("Henley");
  const [boatName, setBoatName] = useState("M1");
  const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (clubName.trim() && raceName.trim() && boatName.trim() && selectedBoat) {
      onFormSubmit(clubName, raceName, boatName, selectedBoat);
    }
  };

  return (
    <div className="race-form-container">
      <Typography variant="h3" className="race-form-title">
        Please enter information about your crew
      </Typography>

      <form onSubmit={handleFormSubmit} className="race-form">
        <Box className="input-grid">
          <TextField
            label="Club Name"
            variant="outlined"
            fullWidth
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            error={hasSubmitted && !clubName.trim()}
            helperText={hasSubmitted && !clubName.trim() ? "Club name is required" : ""}
          />

          <TextField
            label="Race Name"
            variant="outlined"
            fullWidth
            value={raceName}
            onChange={(e) => setRaceName(e.target.value)}
            error={hasSubmitted && !raceName.trim()}
            helperText={hasSubmitted && !raceName.trim() ? "Race name is required" : ""}
          />

          <TextField
            label="Boat Name"
            variant="outlined"
            fullWidth
            value={boatName}
            onChange={(e) => setBoatName(e.target.value)}
            error={hasSubmitted && !boatName.trim()}
            helperText={hasSubmitted && !boatName.trim() ? "Boat name is required" : ""}
          />

          <FormControl fullWidth error={hasSubmitted && !selectedBoat}>
            <InputLabel>Select Boat Class</InputLabel>
            <Select
              value={selectedBoat?.value || ""}
              onChange={(e) => {
                const boat = boatClass.find((b) => b.value === e.target.value);
                setSelectedBoat(boat || null);
              }}
            >
              <MenuItem value="" disabled>Choose a boat class</MenuItem>
              {boatClass.map((boat) => (
                <MenuItem key={boat.value} value={boat.value}>
                  {boat.value}
                </MenuItem>
              ))}
            </Select>
            {hasSubmitted && !selectedBoat && (
              <Typography color="error">Boat class is required</Typography>
            )}
          </FormControl>
        </Box>

        {/* Submit Button */}
        <div className="button-container">
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RaceForm;
