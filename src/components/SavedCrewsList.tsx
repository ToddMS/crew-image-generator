import { SavedCrew } from "../types/index";
import SavedCrewItem from "./SavedCrewItem";

interface SavedCrewsListProps {
  crews: SavedCrew[];
  onEdit: (crewId: string | null) => void;
  onDelete: (crewId: string) => void;
  currentlyEditing: string | null;
  onUpdateNames: (crewId: string, names: string[]) => void;
  onUpdateCrewName: (crewId: string, crewName: string) => void;
}

const SavedCrewsList = ({ 
  crews, 
  onEdit, 
  onDelete, 
  currentlyEditing, 
  onUpdateNames, 
  onUpdateCrewName 
}: SavedCrewsListProps) => {
  return (
    <div>
      <h2>Saved Crews</h2>
      {crews.length === 0 ? (
        <p>No saved crews yet</p>
      ) : (
        <div>
          {crews.map((crew) => (
            <SavedCrewItem
              key={crew.id}
              crew={crew}
              currentlyEditing={currentlyEditing}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdateNames={onUpdateNames}
              onUpdateCrewName={onUpdateCrewName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCrewsList;
