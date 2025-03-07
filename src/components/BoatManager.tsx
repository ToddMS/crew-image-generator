import { useState, useEffect, useRef } from "react";
import { useCrewContext } from "../context/CrewContext";
import RosterForm from "./forms/RosterForm";
import RaceForm from "./forms/RaceForm";
import SavedCrewsList from "./SavedCrewsList";
import "../styles/BoatManager.css";
import { BoatType, Crew } from "../types/crew.types";
import { Button, Box } from "@mui/material";

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
    selectedBoat,
    setSelectedBoat,
    editingCrew,
  } = useCrewContext();

  const [clubName, setClubName] = useState("");
  const [raceName, setRaceName] = useState("");
  const [boatName, setBoatName] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
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

  const handleGenerateImage = async () => {
    if (!selectedCrew) return;

    try {
      const response = await fetch("http://localhost:8080/api/crews/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crewId: selectedCrew.id }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      window.open(imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
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
            onSubmit={() => {}}
          />
        )}
      </div>

      <SavedCrewsList 
        onSelectCrew={setSelectedCrew}
        selectedCrew={selectedCrew}
        crewRefs={crewRefs}
        expandedClubs={expandedClubs}
        setExpandedClubs={setExpandedClubs}
        expandedRaces={expandedRaces}
        setExpandedRaces={setExpandedRaces}
      />

      {selectedCrew && (
          <Box sx={{ position: "fixed", bottom: "20px", right: "20px" }}>
              <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleGenerateImage}
                  sx={{ padding: "10px 20px", fontSize: "16px" }}
              >
                  Generate Crew Image
              </Button>
          </Box>
      )}
    </div>
  );
};

export default BoatManager;
