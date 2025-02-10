import { useState, FormEvent } from "react";
import { BoatType } from "../../types/index";
import { getSeatLabel } from "../../services/BoatService";
import ErrorPopup from "../errors/ErrorPopup";
import "../../styles/forms/RosterForm.css";

interface RosterFormProps {
  selectedBoat: BoatType;
  names: string[];
  onNamesChange: (names: string[]) => void;
  onCrewNameChange: (crewName: string) => void;
  onSubmit: () => void;
}

const RosterForm = ({ selectedBoat, names, onNamesChange, onSubmit }: RosterFormProps) => {
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const validateForm = () => {
    return names.every(name => name.trim());
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowErrors(true);

    if (validateForm()) {
      onSubmit();
    } else {
      setShowErrorPopup(true);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="roster-form">
      {names.map((name, index) => (
        <div key={index}>
          <label>{getSeatLabel(selectedBoat.value, index, names.length)}:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              const newNames = [...names];
              newNames[index] = e.target.value;
              onNamesChange(newNames);
            }}
            className={showErrors && !name.trim() ? "error-flash" : ""}
          />
        </div>
      ))}

      <div className="button-container">
        <button type="submit" className="rounded-button">Submit Roster</button>
        <ErrorPopup message="Please enter all rower names." visible={showErrorPopup} onClose={() => setShowErrorPopup(false)} />
      </div>
    </form>
  );
};

export default RosterForm;
