import { useState, useEffect } from "react";
import { useCrewContext } from "../context/CrewContext";
import RosterForm from "./forms/RosterForm";
import RaceForm from "./forms/RaceForm";
import SavedCrewsList from "./SavedCrewsList";
import "../styles/BoatManager.css";
import { BoatType } from "../types/crew.types"; // ✅ Ensure this import is correct

// ✅ Define boatClass array
const boatClass: BoatType[] = [
    { id: 1, value: "8+", seats: 8, name: "Eight" },
    { id: 2, value: "4+", seats: 4, name: "Four" },
    { id: 3, value: "4-", seats: 4, name: "Coxless Four" },
    { id: 4, value: "4x", seats: 4, name: "Quad" },
    { id: 5, value: "2-", seats: 2, name: "Pair" },
    { id: 6, value: "2x", seats: 2, name: "Double" },
    { id: 7, value: "1x", seats: 1, name: "Single" },
];

const BoatManager = () => {
    const { crews, fetchCrews, addCrew, updateCrew, deleteCrew, selectedBoat, setSelectedBoat, editingCrew } = useCrewContext();

    const [clubName, setClubName] = useState("");
    const [raceName, setRaceName] = useState("");
    const [boatName, setBoatName] = useState("");
    const [names, setNames] = useState<string[]>([]);

    useEffect(() => {
        fetchCrews();
    }, [fetchCrews]);
    
    useEffect(() => {
        console.log("Updated crews list:", crews); // ✅ Debug crews
    }, [crews]); // ✅ Log whenever crews change
    

    useEffect(() => {
        if (editingCrew) {
            setClubName(editingCrew.clubName);
            setRaceName(editingCrew.raceName);
            setBoatName(editingCrew.name);
            setNames([...editingCrew.crewNames]);
            setSelectedBoat(editingCrew.boatType);
        }
    }, [editingCrew, setSelectedBoat]);

    return (
        <div className="boat-manager">
            <RaceForm 
                boatClass={boatClass} // ✅ Passes boatClass properly
                onFormSubmit={(club, race, boat, boatType) => {
                    setClubName(club);
                    setRaceName(race);
                    setBoatName(boat);
                    setSelectedBoat(boatType);
                }} 
            />

            {selectedBoat && <RosterForm 
                clubName={clubName} 
                raceName={raceName} 
                crewName={boatName} 
                selectedBoat={selectedBoat} 
                names={names} 
                onNamesChange={setNames} 
                onSubmit={() => {
                    if (editingCrew) { 
                        updateCrew(editingCrew.id, { 
                            id: editingCrew.id, 
                            name: boatName, 
                            crewNames: names, 
                            boatType: selectedBoat, 
                            clubName, 
                            raceName 
                        });
                    } else {
                        addCrew({
                            name: boatName,
                            crewNames: names,
                            boatType: selectedBoat!,
                            clubName,
                            raceName
                        });
                    }
                }}                
            />}
            <SavedCrewsList />
        </div>
    );
};

export default BoatManager;
