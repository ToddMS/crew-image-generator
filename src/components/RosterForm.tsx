import { ChangeEvent, FormEvent } from "react";
import { BoatType } from "../types";
import { getSeatLabel } from "../services/BoatService";

interface RosterFormProps {
  selectedBoat: BoatType;
  names: string[];
  onNamesChange: (names: string[]) => void;
  onCrewNameChange: (crewName: string) => void;
  onSubmit: () => void;
}

const RosterForm = ({ selectedBoat, names, onNamesChange, onCrewNameChange, onSubmit }: RosterFormProps) => {
  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    onNamesChange(newNames);
  };

  const handleCrewNameChange = (crewName: string) => {
    onCrewNameChange(crewName);
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div>
        <label>Crew Name:</label>
        <input type="text" onChange={(e: ChangeEvent<HTMLInputElement>) => handleCrewNameChange(e.target.value)} placeholder="Enter crew name" />
      </div>

      {names.map((name, index) => (
        <div key={index}>
          <label>{getSeatLabel(selectedBoat.value, index, names.length)}</label>
          <input type="text" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => handleNameChange(index, e.target.value)} placeholder="Enter rower's name" />
        </div>
      ))}

      <button type="submit">Submit Roster</button>
    </form>
  );
};

export default RosterForm;
