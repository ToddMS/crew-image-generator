import { useState } from "react";
import { SavedCrew } from "../types";
import { getSeatLabel } from "../services/BoatService";
import EditCrewForm from "./forms/EditCrewForm";
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

  const handleToggleExpansion = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "BUTTON") return;

    if (isExpanded) {
      onEdit(null);
    }

    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`crew-item ${isExpanded ? "expanded" : ""}`} onClick={handleToggleExpansion}>
      <div className="crew-summary">
        <h3>{crew.clubName}</h3>
        <h3>{crew.raceName}</h3>
        <h3>{crew.name} - {crew.boatType.value}</h3> {/* ✅ Uses latest crew name from props */}
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
        <div className="crew-details" onClick={(e) => e.stopPropagation()}>
          {currentlyEditing === crew.id ? (
            <EditCrewForm
              crew={crew}
              onUpdateNames={onUpdateNames}
              onUpdateCrewName={onUpdateCrewName}
              onCancel={() => onEdit(null)}
            />
          ) : (
            <>
              <h4>Crew Members:</h4>
              {crew.crewNames.map((name, index) => (
                <p key={index}>
                  <strong>{getSeatLabel(crew.boatType.value, index, crew.crewNames.length)}:</strong> {name}
                </p>
              ))}
              <button onClick={(e) => { e.stopPropagation(); onEdit(crew.id); }}>
                Edit Crew
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedCrewItem;
