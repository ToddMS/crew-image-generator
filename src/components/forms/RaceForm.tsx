import { useState, FormEvent } from "react";
import { BoatType } from "../../types";
import "../../styles/forms/RaceForm.css";
import { TextField, Typography, Button, MenuItem, Select, FormControl, InputLabel, Box } from "@mui/material";

interface RaceFormProps {
  boatClass: BoatType[];
  onSelectBoat: (selectedBoat: BoatType) => void;
  onFormSubmit: (club: string, race: string, boat: string, selectedBoat: BoatType) => void;
}

const RaceForm = ({ boatClass, onSelectBoat, onFormSubmit }: RaceFormProps) => {
  const [clubName, setClubName] = useState("Auriol Kensington");
  const [raceName, setRaceName] = useState("Henley");
  const [boatName, setBoatName] = useState("M1");
  const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const validateForm = () => {
    const newErrors = {
      clubName: !clubName.trim(),
      raceName: !raceName.trim(),
      boatName: !boatName.trim(),
      selectedBoat: !selectedBoat,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm() && selectedBoat) {
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
            className="crew-info"
            label="Club Name"
            variant="outlined"
            fullWidth
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            error={errors.clubName}
            helperText={errors.clubName ? "Club name is required" : ""}
          />

          <TextField
            className="crew-info"
            label="Race Name"
            variant="outlined"
            fullWidth
            value={raceName}
            onChange={(e) => setRaceName(e.target.value)}
            error={errors.raceName}
            helperText={errors.raceName ? "Race name is required" : ""}
          />

          <TextField
            className="crew-info"
            label="Boat Name"
            variant="outlined"
            fullWidth
            value={boatName}
            onChange={(e) => setBoatName(e.target.value)}
            error={errors.boatName}
            helperText={errors.boatName ? "Boat name is required" : ""}
          />

          <FormControl fullWidth error={errors.selectedBoat}>
            <Select
              label='Select Boat Class'
              className="crew-info"
              value={selectedBoat?.value || ""}
              onChange={(e) => {
                const boat = boatClass.find((b) => b.value === e.target.value);
                setSelectedBoat(boat || null);
                if (boat) {
                  onSelectBoat(boat);
                }
              }}
            >
              <MenuItem value="" disabled>Choose a boat class</MenuItem>
              {boatClass.map((boat) => (
                <MenuItem key={boat.value} value={boat.value}>
                  {boat.value}
                </MenuItem>
              ))}
            </Select>
            {errors.selectedBoat && <Typography color="error">Boat class is required</Typography>}
          </FormControl>
        </Box>

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
