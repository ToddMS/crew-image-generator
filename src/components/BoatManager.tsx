import { useState, useEffect } from "react";
import { BoatType, SavedCrew } from "../types";
import RosterForm from "./RosterForm";
import RaceForm from "./RaceForm";
import SavedCrewsList from "./SavedCrewsList";
import { createCrew, addCrew, getCrews, deleteCrew } from "../services/BoatService";
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
  const [clubName, setClubName] = useState<string>("Auriol Kensington");
  const [raceName, setRaceName] = useState<string>("Henley");
  const [boatName, setBoatName] = useState<string>("M1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [savedCrews, setSavedCrews] = useState<SavedCrew[]>([]);
  const [isCreatingCrew, setIsCreatingCrew] = useState<boolean>(false);

  useEffect(() => {
    setSavedCrews(getCrews());
  }, []);

  const handleSelectBoat = (boat: BoatType) => {
    setSelectedBoat(boat);
  };

  const handleCreateCrew = () => {
    if (!selectedBoat || !clubName || !raceName || !boatName) return;
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

  return (
    <div className="boat-manager-container">
      <table className="full-screen-table">
        <thead>
          <tr>
            <th colSpan={3} className="table-header">
              <RaceForm boatClass={boatClass} onSelectBoat={handleSelectBoat} />
              <button className="create-crew-button" onClick={handleCreateCrew} disabled={!selectedBoat}>
                Create Crew
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="content-row">
            <td className="column">
              <h3>Club Race Crews</h3>
              <p>Manage club-wide race crews here (e.g., Henley crews).</p>
            </td>
            <td className="column">
              {isCreatingCrew && selectedBoat && (
                <RosterForm
                  selectedBoat={selectedBoat}
                  names={names}
                  onNamesChange={setNames}
                  onCrewNameChange={setBoatName}
                  onSubmit={handleSubmitRoster}
                />
              )}
            </td>
            <td className="column">
              <SavedCrewsList
                crews={savedCrews}
                onEdit={() => {}}
                onDelete={() => {}}
                currentlyEditing={null}
                onUpdateNames={() => {}}
                onUpdateCrewName={() => {}}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BoatManager;
