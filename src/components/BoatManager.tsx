import { useState, FormEvent, useEffect } from 'react';
import { BoatType, SavedCrew } from '../types';
import RosterForm from './RosterForm';
import BoatSelector from './BoatSelector';
import SavedCrewsList from './SavedCrewsList';
import { createCrew, addCrew, deleteCrew, getCrews, updateCrew } from '../services/BoatService';

const BoatManager = () => {
  const [boatClass] = useState<BoatType[]>([
    { value: "8+", seats: 9 },
    { value: "4+", seats: 5 },
    { value: "4-", seats: 4 },
    { value: "4x", seats: 4 },
    { value: "2-", seats: 2 },
    { value: "2x", seats: 2 },
    { value: "1x", seats: 1 }
  ]);

  const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [savedCrews, setSavedCrews] = useState<SavedCrew[]>([]);

  useEffect(() => {
    setSavedCrews(getCrews());
  }, []);

  const handleBoatSelect = (boat: BoatType) => {
    setSelectedBoat(boat);
    setNames(Array(boat.seats).fill(''));
  };

  const handleDelete = (crewId: string) => {
    deleteCrew(crewId);
    setSavedCrews(getCrews());
  };

  const handleEdit = (crewId: string | null) => {
    setEditingId(crewId);

    if (crewId) {
      const crewToEdit = savedCrews.find(crew => crew.id === crewId);
      if (crewToEdit) {
        setSelectedBoat(crewToEdit.boatType);
        setNames(crewToEdit.crewNames);
      }
    }
  };

  const handleUpdateNames = (crewId: string, updatedNames: string[]) => {
    setSavedCrews(prevCrews =>
      prevCrews.map(crew =>
        crew.id === crewId ? { ...crew, crewNames: updatedNames } : crew
      )
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedBoat) return;

    if (editingId) {
      const updatedCrew: SavedCrew = {
        id: editingId,
        name: `Crew for ${selectedBoat.value}`,
        crewNames: names,
        boatType: selectedBoat,
      };

      updateCrew(updatedCrew);
      console.log("Updated Crew Saved:", updatedCrew);

      setEditingId(null);
    } else {
      const newCrew = createCrew(selectedBoat, names);
      addCrew(newCrew);
    }

    setSavedCrews(getCrews());
  };

  return (
    <div>
      <BoatSelector boatClass={boatClass} onBoatSelect={handleBoatSelect} />
      
      {selectedBoat && (
        <RosterForm
          selectedBoat={selectedBoat}
          names={names}
          onNamesChange={setNames}
          onSubmit={handleSubmit}
        />
      )}
      <SavedCrewsList 
        crews={savedCrews}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        currentlyEditing={editingId}
        onUpdateNames={handleUpdateNames}
      />
    </div>
  );
};

export default BoatManager;
