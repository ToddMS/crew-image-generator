import { ChangeEvent } from 'react';
import { SavedCrew } from '../types/index';
import { getSeatLabel } from '../services/BoatService';

interface SavedCrewsListProps {
  crews: SavedCrew[];
  onEdit: (crewId: string | null) => void;
  onDelete: (crewId: string) => void;
  currentlyEditing: string | null;
  onUpdateNames: (crewId: string, names: string[]) => void;
}

const SavedCrewsList = ({ crews, onEdit, onDelete, currentlyEditing, onUpdateNames }: SavedCrewsListProps) => {

  const handleDeleteClick = (crewId: string) => {
    onDelete(crewId);
  };

  const handleEditClick = (crewId: string) => {
    if (currentlyEditing === crewId) {
      onEdit(null);
    } else {
      onEdit(crewId);
    }
  };

  const handleNameChange = (crewId: string, index: number, value: string) => {
    const updatedNames = [...(crews.find(crew => crew.id === crewId)?.crewNames || [])];
    updatedNames[index] = value;
    onUpdateNames(crewId, updatedNames);
  };

  return (
    <div>
      <h2>Saved Crews</h2>
      {crews.length === 0 ? (
        <p>No saved crews yet</p>
      ) : (
        <div>
          {crews.map((crew) => (
            <div 
              key={crew.id}
              className={currentlyEditing === crew.id ? "editing-highlight" : ""}
              style={{
                padding: '10px',
                margin: '10px 0',
                border: '1px solid #ccc',
              }}
            >
              <h3>Boat: {crew.boatType.value}</h3>
              <h4>Crew Name: {crew.name}</h4>
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
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleNameChange(crew.id, index, e.target.value)}
                        />
                      </div>
                    ) : (
                      <p>
                        <strong>{getSeatLabel(crew.boatType.value, index, crew.crewNames.length)}:</strong> {name}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <button 
                  onClick={() => handleEditClick(crew.id)}
                  disabled={Boolean(currentlyEditing && currentlyEditing !== crew.id)}
                >
                  {currentlyEditing === crew.id ? 'Update' : 'Edit'}
                </button>
                <button 
                  onClick={() => handleDeleteClick(crew.id)}
                  disabled={currentlyEditing === crew.id}
                >
                  Delete
                </button> 
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCrewsList;
