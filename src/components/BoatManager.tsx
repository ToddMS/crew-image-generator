import { useState, useEffect, useRef } from "react";
import { useCrewContext } from "../context/CrewContext";
import RosterForm from "./forms/RosterForm";
import RaceForm from "./forms/RaceForm";
import SavedCrewsList from "./SavedCrewsList";
import TemplatePickerSidebar from "./TemplatePickerSidebar";
import "../styles/BoatManager.css";
import { BoatType, Crew, Template } from "../types/crew.types";
import { ApiService } from "../services/api.service";

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
  
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [expandedClubs, setExpandedClubs] = useState<Record<string, boolean>>({});
  const [expandedRaces, setExpandedRaces] = useState<Record<string, boolean>>({});
  const rosterFormRef = useRef<HTMLDivElement | null>(null);
  const crewRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const templates = [
    { id: 1, image: 'template1.png' },
    { id: 2, image: 'template2.png' },
  ];

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

  const handleGenerateImage = async (imageName: string) => {
    if (!selectedCrew || !selectedTemplate) return;

    try {
      const response = await fetch("http://localhost:8080/api/crews/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crewId: selectedCrew.id, templateId: selectedTemplate.id, imageName }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      window.open(imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const handleSubmitRoster = async () => {
    if (!selectedBoat) return;
  
    const crewData = {
      name: boatName,
      crewNames: names,
      boatType: selectedBoat,
      clubName,
      raceName,
    };
  
    const { data, error } = await ApiService.createCrew(crewData);
  
    if (error) {
      console.error("Error creating crew:", error);
      return;
    }
  
    setSelectedCrew(data!);
    fetchCrews();
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
          onSubmit={handleSubmitRoster}
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
        <TemplatePickerSidebar
          crew={selectedCrew}
          templates={templates}
          onSelectTemplate={setSelectedTemplate}
          selectedTemplate={selectedTemplate}
          onGenerate={handleGenerateImage}
        />
      )}
    </div>
  );
};

export default BoatManager;