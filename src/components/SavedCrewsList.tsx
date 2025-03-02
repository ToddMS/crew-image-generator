import { useCrewContext } from "../context/CrewContext";
import SavedCrewItem from "./SavedCrewItem";
import { Typography, Box, Button } from "@mui/material";
import { Crew } from "../types/crew.types";
import "../styles/SavedCrewList.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface SavedCrewsListProps {
    crewRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
    expandedClubs: Record<string, boolean>;
    setExpandedClubs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    expandedRaces: Record<string, boolean>;
    setExpandedRaces: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const SavedCrewsList = ({ 
    crewRefs, 
    expandedClubs, 
    setExpandedClubs, 
    expandedRaces, 
    setExpandedRaces
}: SavedCrewsListProps) => {
    const { crews } = useCrewContext();

    const groupedCrews = crews.reduce((acc, crew) => {
        if (!acc[crew.clubName]) {
            acc[crew.clubName] = {};
        }
        if (!acc[crew.clubName][crew.raceName]) {
            acc[crew.clubName][crew.raceName] = [];
        }
        acc[crew.clubName][crew.raceName].push(crew);
        return acc;
    }, {} as Record<string, Record<string, Crew[]>>);

    const handleToggleClub = (clubName: string) => {
        setExpandedClubs((prev) => {
            const isExpanding = !prev[clubName];
            const newState = { ...prev, [clubName]: isExpanding };
            
            if (!isExpanding) {
                // If club is being closed, close all races within it
                setExpandedRaces((racePrev) => {
                    const updatedRaces = { ...racePrev };
                    Object.keys(groupedCrews[clubName] || {}).forEach((race) => {
                        delete updatedRaces[`${clubName}-${race}`];
                    });
                    return updatedRaces;
                });
            }
            return newState;
        });
    };

    const handleToggleRace = (clubName: string, raceName: string) => {
        setExpandedRaces((prev) => {
            const raceKey = `${clubName}-${raceName}`;
            return { ...prev, [raceKey]: !prev[raceKey] };
        });
    };

    return (
        <Box className="saved-crews-container">
            <Box className="saved-crews-box">
                <Typography variant="h4" className="saved-crews-title">Saved Crews</Typography>

                {Object.entries(groupedCrews).map(([clubName, races]) => (
                    <Box key={clubName} className="club-section">
                        <Button className="toggle-button" onClick={() => handleToggleClub(clubName)}>
                            {expandedClubs[clubName] ? <ExpandLessIcon /> : <ExpandMoreIcon />} {clubName}
                        </Button>

                        {expandedClubs[clubName] && Object.entries(races).map(([raceName, crews]) => (
                            <Box key={raceName} className="race-section">
                                <Button className="toggle-button race-toggle" onClick={() => handleToggleRace(clubName, raceName)}>
                                    {expandedRaces[`${clubName}-${raceName}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />} {raceName}
                                </Button>

                                {expandedRaces[`${clubName}-${raceName}`] && (
                                    <Box className="crew-grid">
                                        {crews.map((crew) => (
                                            <SavedCrewItem 
                                                key={crew.id} 
                                                crew={crew} 
                                                ref={(el) => {
                                                    if (el) crewRefs.current[crew.id] = el;
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                ))}

                {crews.length === 0 && <Typography>No saved crews</Typography>}
            </Box>
        </Box>
    );
};

export default SavedCrewsList;
