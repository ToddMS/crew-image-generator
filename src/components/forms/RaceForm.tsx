import { useState, FormEvent } from "react";
import { BoatType } from "../../types";
import ErrorPopup from "../errors/ErrorPopup";
import "../../styles/forms/RaceForm.css";

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
  const [showErrorPopup, setShowErrorPopup] = useState(false);
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
    } else {
      setShowErrorPopup(true);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="club-race-form">
      <div>
        <label>Club Name:</label>
        <input
          type="text"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
          className={errors.clubName ? "error-flash" : ""}
        />
      </div>

      <div>
        <label>Race Name:</label>
        <input
          type="text"
          value={raceName}
          onChange={(e) => setRaceName(e.target.value)}
          className={errors.raceName ? "error-flash" : ""}
        />
      </div>

      <div>
        <label>Boat Name:</label>
        <input
          type="text"
          value={boatName}
          onChange={(e) => setBoatName(e.target.value)}
          className={errors.boatName ? "error-flash" : ""}
        />
      </div>

      <div>
        <label>Select Boat Class:</label>
        <select
          value={selectedBoat?.value || ""}
          onChange={(e) => {
            const boat = boatClass.find((b) => b.value === e.target.value);
            setSelectedBoat(boat || null);
            if (boat) {
              onSelectBoat(boat);
            }
          }}
          className={errors.selectedBoat ? "error-flash" : ""}
        >
          <option value="" disabled>Choose a boat class</option>
          {boatClass.map((boat) => (
            <option key={boat.value} value={boat.value}>
              {boat.value}
            </option>
          ))}
        </select>
      </div>

      <div className="button-container">
        <button type="submit" className="rounded-button">Submit</button>
        <ErrorPopup message="Please fill in all required fields." visible={showErrorPopup} onClose={() => setShowErrorPopup(false)} />
      </div>
    </form>
  );
};

export default RaceForm;
