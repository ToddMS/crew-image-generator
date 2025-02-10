import { useState, useEffect, FormEvent } from "react";
import { SavedCrew } from "../../types/index";
import { getSeatLabel } from "../../services/BoatService";
import ErrorPopup from "../errors/ErrorPopup";
import "../../styles/forms/EditCrewForm.css";

interface EditCrewFormProps {
  crew: SavedCrew;
  onUpdateNames: (crewId: string, names: string[]) => void;
  onUpdateCrewName: (crewId: string, crewName: string) => void;
  onCancel: () => void;
}

const EditCrewForm = ({ crew, onUpdateNames, onCancel }: EditCrewFormProps) => {
  const [crewMembers, setCrewMembers] = useState([...crew.crewNames]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setCrewMembers([...crew.crewNames]);
  }, [crew.crewNames]);

  const validateForm = () => {
    return crewMembers.every(name => name.trim() !== "");
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowErrors(true);

    if (validateForm()) {
      onUpdateNames(crew.id, crewMembers);
      onCancel();
    } else {
      setShowErrorPopup(true);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="edit-crew-form">
      <h3>Edit Crew</h3>
      <h4>Crew Members:</h4>
      {crewMembers.map((name, index) => (
        <div key={index}>
          <label>{getSeatLabel(crew.boatType.value, index, crewMembers.length)}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              const updatedNames = [...crewMembers];
              updatedNames[index] = e.target.value;
              setCrewMembers(updatedNames);
            }}
            className={showErrors && !name.trim() ? "error-flash" : ""}
          />
        </div>
      ))}

      <div className="button-container">
        <button type="submit" className="rounded-button">Save</button>
        <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
        <ErrorPopup message="Please fill in all fields before saving." visible={showErrorPopup} onClose={() => setShowErrorPopup(false)} />
      </div>
    </form>
  );
};

export default EditCrewForm;
