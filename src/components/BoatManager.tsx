import { useState, useEffect, useRef } from "react";
import { useCrewContext } from "../context/CrewContext";
import RosterForm from "./forms/RosterForm";
import RaceForm from "./forms/RaceForm";
import SavedCrewsList from "./SavedCrewsList";
import "../styles/BoatManager.css";
import { BoatType } from "../types/crew.types";

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
    const {
        fetchCrews,
        addCrew,
        updateCrew,
        selectedBoat,
        setSelectedBoat,
        editingCrew,
        setEditingCrew,
    } = useCrewContext();

    const [clubName, setClubName] = useState("");
    const [raceName, setRaceName] = useState("");
    const [boatName, setBoatName] = useState("");
    const [names, setNames] = useState<string[]>([]);
    const [expandedClubs, setExpandedClubs] = useState<Record<string, boolean>>({});
    const [expandedRaces, setExpandedRaces] = useState<Record<string, boolean>>({});
    const rosterFormRef = useRef<HTMLDivElement | null>(null);
    const crewRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        fetchCrews();
    }, [fetchCrews]);

    useEffect(() => {
        if (editingCrew) {
            setClubName(editingCrew.clubName);
            setRaceName(editingCrew.raceName);
            setBoatName(editingCrew.name);
            setNames([...editingCrew.crewNames]);
            setSelectedBoat(editingCrew.boatType);

            setTimeout(() => {
                rosterFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }, [editingCrew, setSelectedBoat]);

    const toggleClub = (clubName: string) => {
        setExpandedClubs((prev) => ({
            ...prev,
            [clubName]: !prev[clubName]
        }));
    };

    const toggleRace = (raceKey: string) => {
        setExpandedRaces((prev) => ({
            ...prev,
            [raceKey]: !prev[raceKey]
        }));
    };

    const handleSubmit = async () => {
        if (!selectedBoat) {
            console.error("No boat type selected!");
            return;
        }

        let updatedCrew;
        if (editingCrew) {
            updatedCrew = {
                ...editingCrew,
                name: boatName,
                crewNames: names,
                boatType: selectedBoat,
                clubName,
                raceName,
            };
            await updateCrew(editingCrew.id, updatedCrew);
            setEditingCrew(null);
        } else {
            updatedCrew = await addCrew({
                name: boatName,
                crewNames: names,
                boatType: selectedBoat,
                clubName,
                raceName,
            });
        }
    };

    return (
        <div className="boat-manager">
            <RaceForm
                boatClass={boatClass}
                onFormSubmit={(club, race, boat, boatType) => {
                    setClubName(club);
                    setRaceName(race);
                    setBoatName(boat);
                    setSelectedBoat(boatType);
                }}
            />

            <div ref={rosterFormRef}>
                {selectedBoat && (
                    <RosterForm
                        clubName={clubName}
                        raceName={raceName}
                        crewName={boatName}
                        selectedBoat={selectedBoat}
                        names={names}
                        onNamesChange={setNames}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>

            <SavedCrewsList 
                crewRefs={crewRefs} 
                expandedClubs={expandedClubs} 
                toggleClub={toggleClub} 
                expandedRaces={expandedRaces} 
                toggleRace={toggleRace} 
            />
        </div>
    );
};

export default BoatManager;