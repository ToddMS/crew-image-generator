import { useState, ChangeEvent } from "react";
import { SavedCrew } from "../types";
import { getSeatLabel } from "../services/BoatService";
import "../styles/SavedCrewItem.css";

interface SavedCrewItemProps {
  crew: SavedCrew;
  currentlyEditing: string | null;
  onEdit: (crewId: string | null) => void;
  onDelete: (crewId: string) => void;
  onUpdateNames: (crewId: string, names: string[]) => void;
  onUpdateCrewName: (crewId: string, crewName: string) => void;
}

const SavedCrewItem = ({
  crew,
  currentlyEditing,
  onEdit,
  onDelete,
  onUpdateNames,
  onUpdateCrewName,
}: SavedCrewItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNameChange = (index: number, value: string) => {
    const updatedNames = [...crew.crewNames];
    updatedNames[index] = value;
    onUpdateNames(crew.id, updatedNames);
  };

  const handleCrewNameChange = (updatedCrewName: string) => {
    onUpdateCrewName(crew.id, updatedCrewName);
  };

  return (
    <div
      className={`crew-item ${isExpanded ? "expanded" : ""}`}
      onClick={toggleExpansion}
    >
      <div className="crew-summary">
        <h3>{crew.clubName}</h3>
        <h3>{crew.raceName}</h3>
        <h3>{crew.name} - {crew.boatType.value}</h3>
      </div>
      <div>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(crew.id); }} 
              disabled={currentlyEditing === crew.id}
            >
              Delete
            </button>
          </div>

      {isExpanded && (
        <div className="crew-details">
          {currentlyEditing === crew.id ? (
            <>
              <h4>Crew Name:</h4>
              <input
                type="text"
                value={crew.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleCrewNameChange(e.target.value)}
              />
            </>
          ) : null}

          <div>
            <h4>Crew Members:</h4>
            {crew.crewNames.map((name, index) => (
              <div key={index}>
                {currentlyEditing === crew.id ? (
                  <div>
                    <label>{getSeatLabel(crew.boatType.value, index, crew.crewNames.length)}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleNameChange(index, e.target.value)}
                    />
                  </div>
                ) : (
                  <p>
                    <strong>{getSeatLabel(crew.boatType.value, index, crew.crewNames.length)}:</strong> {name}
                  </p>
                )}
              </div>
            ))}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(crew.id); }}
              disabled={Boolean(currentlyEditing && currentlyEditing !== crew.id)}
            >
              {currentlyEditing === crew.id ? "Update" : "Edit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedCrewItem;
