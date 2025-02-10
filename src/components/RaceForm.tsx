import { useState, ChangeEvent } from "react";
import { BoatType } from "../types";

interface RaceFormProps {
  boatClass: BoatType[];
  onSelectBoat: (selectedBoat: BoatType) => void;
}

const RaceForm = ({ boatClass, onSelectBoat }: RaceFormProps) => {
  const [clubName, setClubName] = useState("Auriol Kensington");
  const [raceName, setRaceName] = useState("Henley");
  const [boatName, setBoatName] = useState("M1");
  const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);

  const handleBoatSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const boat = boatClass.find((b) => b.value === e.target.value);
    if (boat) {
      setSelectedBoat(boat);
      onSelectBoat(boat);
    }
  };

  return (
    <div className="club-race-form">
      <div>
        <label>Club Name:</label>
        <input
          type="text"
          value={clubName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setClubName(e.target.value)}
        />
      </div>

      <div>
        <label>Race Name:</label>
        <input
          type="text"
          value={raceName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRaceName(e.target.value)}
        />
      </div>

      <div>
        <label>Boat Name:</label>
        <input
          type="text"
          value={boatName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBoatName(e.target.value)}
        />
      </div>

      <div>
        <label>Select Boat Class:</label>
        <select value={selectedBoat?.value || ""} onChange={handleBoatSelect}>
          <option value="" disabled>Choose a boat class</option>
          {boatClass.map((boat) => (
            <option key={boat.value} value={boat.value}>
              {boat.value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RaceForm;
