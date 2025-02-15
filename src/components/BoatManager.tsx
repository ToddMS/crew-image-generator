import { useState, useEffect } from "react";
import { BoatType, SavedCrew } from "../types";
import RosterForm from "./forms/RosterForm";
import RaceForm from "./forms/RaceForm";
import SavedCrewsList from "./SavedCrewsList";
import { createCrew, addCrew, getCrews, deleteCrew, updateCrew } from "../services/BoatService";
import "../styles/BoatManager.css";

const BoatManager = () => {
  const [boatClass] = useState<BoatType[]>([
    { value: "8+", seats: 8, name: "Eight" },
    { value: "4+", seats: 4, name: "Four" },
    { value: "4-", seats: 4, name: "Coxless Four" },
    { value: "4x", seats: 4, name: "Quad" },
    { value: "2-", seats: 2, name: "Pair" },
    { value: "2x", seats: 2, name: "Double" },
    { value: "1x", seats: 1, name: "Single" },
  ]);


  const [selectedBoat, setSelectedBoat] = useState<BoatType>();
  const [clubName, setClubName] = useState("");
  const [raceName, setRaceName] = useState("");
  const [boatName, setBoatName] = useState("");
  const [names, setNames] = useState<string[]>(Array(9).fill(""));
  const [savedCrews, setSavedCrews] = useState<SavedCrew[]>([]);
  const [editingCrew, setEditingCrew] = useState<SavedCrew | null>(null);

  useEffect(() => {
    setSavedCrews(getCrews());
  }, []);

  const handleFormSubmit = (club: string, race: string, boat: string, selectedBoat: BoatType) => {
    setClubName(club);
    setRaceName(race);
    setBoatName(boat);
    setSelectedBoat(selectedBoat);
    const seatsCount = selectedBoat.value.includes('+') ? selectedBoat.seats + 1 : selectedBoat.seats;
    setNames(Array(seatsCount).fill(""));
  };

  const handleSubmitRoster = () => {
    if (!selectedBoat || names.some((name) => name.trim() === "")) return;
  
    if (editingCrew) {
      const updatedCrew = { ...editingCrew, crewNames: names };
      updateCrew(updatedCrew);
      setEditingCrew(null);
    } else {
      const newCrew = createCrew(selectedBoat, names, boatName, clubName, raceName);
      addCrew(newCrew);
    }
  
    setSavedCrews(getCrews());
  
    setNames(Array(selectedBoat.value.includes('+') ? selectedBoat.seats + 1 : selectedBoat.seats).fill(""));
  };

  const handleEditCrew = (crewId: string | null) => {
    if (!crewId) {
      setEditingCrew(null);
      return;
    }

    const crewToEdit = savedCrews.find((crew) => crew.id === crewId);
    if (!crewToEdit) return;

    setEditingCrew(crewToEdit);
    setSelectedBoat(crewToEdit.boatType);
    setNames([...crewToEdit.crewNames]);
  };

  const handleDeleteCrew = (crewId: string) => {
    deleteCrew(crewId);
    setSavedCrews(getCrews());
  };

  return (
    <div className="boat-manager">
      <RaceForm
        boatClass={boatClass}
        onFormSubmit={handleFormSubmit}
      />

      {selectedBoat && (
        <RosterForm
          selectedBoat={selectedBoat}
          names={names}
          onNamesChange={setNames}
          onSubmit={handleSubmitRoster}
          clubName={clubName}
          raceName={raceName}
          crewName={boatName}
        />
      )}

      <SavedCrewsList
        crews={savedCrews}
        currentlyEditing={editingCrew?.id || null}
        onEdit={handleEditCrew}
        onDelete={handleDeleteCrew}
        onUpdateNames={(crewId, updatedNames) => {
          const crew = savedCrews.find(c => c.id === crewId);
          if (crew) {
            updateCrew({ ...crew, crewNames: updatedNames });
            setSavedCrews(getCrews());
          }
        }}
        onUpdateCrewName={(crewId, updatedCrewName) => {
          const crew = savedCrews.find(c => c.id === crewId);
          if (crew) {
            updateCrew({ ...crew, name: updatedCrewName });
            setSavedCrews(getCrews());
          }
        }}
      />
    </div>
  );
};

export default BoatManager;