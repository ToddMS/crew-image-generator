import { useState, useEffect } from "react";
import { BoatType, SavedCrew } from "../types";
import RosterForm from "./forms/RosterForm";
import RaceForm from "./forms/RaceForm";
import SavedCrewsList from "./SavedCrewsList";
import { createCrew, getCrews, deleteCrew, updateCrew } from "../services/BoatService";
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

    const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);
    const [clubName, setClubName] = useState("");
    const [raceName, setRaceName] = useState("");
    const [boatName, setBoatName] = useState("");
    const [names, setNames] = useState<string[]>([]);
    const [savedCrews, setSavedCrews] = useState<SavedCrew[]>([]);
    const [editingCrew, setEditingCrew] = useState<SavedCrew | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch crews from backend on component mount
    useEffect(() => {
        async function fetchCrews() {
            setLoading(true);
            try {
                const crews = await getCrews();
                setSavedCrews(crews);
            } catch (error) {
                console.error("Failed to fetch crews:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCrews();
    }, []);

    const handleFormSubmit = (club: string, race: string, boat: string, selectedBoat: BoatType) => {
        setClubName(club);
        setRaceName(race);
        setBoatName(boat);
        setSelectedBoat(selectedBoat);
        setNames(Array(selectedBoat.value.includes('+') ? selectedBoat.seats + 1 : selectedBoat.seats).fill(""));
    };

    const handleSubmitRoster = async () => {
        if (!selectedBoat || names.some((name) => name.trim() === "")) return;

        setLoading(true);
        try {
            if (editingCrew) {
                const updatedCrew = { ...editingCrew, crewNames: names };
                await updateCrew(editingCrew.id, updatedCrew);
                setEditingCrew(null);
            } else {
                const newCrew = await createCrew({
                    name: boatName,
                    crewNames: names,
                    boatType: selectedBoat.value,
                    clubName,
                    raceName,
                });

                if (newCrew) {
                    setSavedCrews(await getCrews());
                }
            }
        } catch (error) {
            console.error("Error submitting crew:", error);
        } finally {
            setLoading(false);
            setNames(Array(selectedBoat.value.includes('+') ? selectedBoat.seats + 1 : selectedBoat.seats).fill(""));
        }
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

    const handleDeleteCrew = async (crewId: string) => {
        setLoading(true);
        try {
            await deleteCrew(crewId);
            setSavedCrews(await getCrews());
        } catch (error) {
            console.error("Error deleting crew:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCrew = async (crewId: string, updatedData: Partial<SavedCrew>) => {
        setLoading(true);
        try {
            await updateCrew(crewId, updatedData);
            setSavedCrews(await getCrews()); // Refresh list after update
        } catch (error) {
            console.error("Error updating crew:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="boat-manager">
            <RaceForm boatClass={boatClass} onFormSubmit={handleFormSubmit} />

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

            {loading && <p>Loading...</p>} {/* Show loading indicator if data is being fetched */}

            <SavedCrewsList
                crews={savedCrews}
                currentlyEditing={editingCrew?.id || null}
                onEdit={handleEditCrew}
                onDelete={handleDeleteCrew}
                onUpdateNames={(crewId, updatedNames) => {
                    handleUpdateCrew(crewId, { crewNames: updatedNames });
                }}
                onUpdateCrewName={(crewId, updatedCrewName) => {
                    handleUpdateCrew(crewId, { name: updatedCrewName });
                }}
            />
        </div>
    );
};

export default BoatManager;
