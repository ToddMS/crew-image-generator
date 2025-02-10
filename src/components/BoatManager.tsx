import { useState, useEffect } from "react";
import { BoatType, SavedCrew } from "../types";
import RosterForm from "./forms/RosterForm";
import RaceForm from "./forms/RaceForm";
import SavedCrewsList from "./SavedCrewsList";
import { createCrew, addCrew, getCrews, deleteCrew, updateCrew } from "../services/BoatService";
import "../styles/BoatManager.css";

const BoatManager = () => {
  const [boatClass] = useState<BoatType[]>([
    { value: "8+", seats: 9 },
    { value: "4+", seats: 5 },
    { value: "4-", seats: 4 },
    { value: "4x", seats: 4 },
    { value: "2-", seats: 2 },
    { value: "2x", seats: 2 },
    { value: "1x", seats: 1 },
  ]);

  const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);
  const [clubName, setClubName] = useState<string>("");
  const [raceName, setRaceName] = useState<string>("");
  const [boatName, setBoatName] = useState<string>("");
  const [names, setNames] = useState<string[]>([]);
  const [savedCrews, setSavedCrews] = useState<SavedCrew[]>([]);
  const [isCreatingCrew, setIsCreatingCrew] = useState<boolean>(false);
  const [currentlyEditing, setCurrentlyEditing] = useState<string | null>(null);

  useEffect(() => {
    setSavedCrews(getCrews());
  }, []);

  const handleFormSubmit = (club: string, race: string, boat: string, selectedBoat: BoatType) => {
    setClubName(club);
    setRaceName(race);
    setBoatName(boat);
    setSelectedBoat(selectedBoat);
    setNames(Array(selectedBoat.seats).fill(""));
    setIsCreatingCrew(true);
  };

  const handleSubmitRoster = () => {
    if (!selectedBoat || names.some((name) => name.trim() === "")) return;

    const newCrew = createCrew(selectedBoat, names, boatName, clubName, raceName);
    addCrew(newCrew);
    setSavedCrews(getCrews()); 

    setIsCreatingCrew(false);
    setSelectedBoat(null);
    setNames([]);
  };

  const handleEditCrew = (crewId: string | null) => {
    setCurrentlyEditing(crewId);
  };

  const handleUpdateNames = (crewId: string, updatedNames: string[]) => {
    const updatedCrew = savedCrews.find(crew => crew.id === crewId);
    if (!updatedCrew) return;

    const newCrew = { ...updatedCrew, crewNames: updatedNames };
    updateCrew(newCrew);
    setSavedCrews(getCrews()); 
  };

  const handleUpdateCrewName = (crewId: string, updatedCrewName: string) => {
    const updatedCrew = savedCrews.find(crew => crew.id === crewId);
    if (!updatedCrew) return;

    const newCrew = { ...updatedCrew, name: updatedCrewName };
    updateCrew(newCrew);
    setSavedCrews(getCrews());
  };

  const handleDeleteCrew = (crewId: string) => {
    deleteCrew(crewId);
    setSavedCrews(getCrews());
  };

  return (
    <>
      <div className="race-form-container">
        <RaceForm 
          boatClass={boatClass} 
          onSelectBoat={setSelectedBoat} 
          onFormSubmit={handleFormSubmit} 
        />
      </div>

          
        
              {isCreatingCrew && selectedBoat && (
                <RosterForm
                  selectedBoat={selectedBoat}
                  names={names}
                  onNamesChange={setNames}
                  onCrewNameChange={setBoatName}
                  onSubmit={handleSubmitRoster}
                />
              )}
            
            
              <SavedCrewsList
                crews={savedCrews}
                onEdit={handleEditCrew}
                onDelete={handleDeleteCrew}
                currentlyEditing={currentlyEditing}
                onUpdateNames={handleUpdateNames}
                onUpdateCrewName={handleUpdateCrewName}
              />
            
    </>
  );
};

export default BoatManager;
