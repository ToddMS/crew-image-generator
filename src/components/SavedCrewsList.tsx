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
    toggleClub: (clubName: string) => void;
    expandedRaces: Record<string, boolean>;
    toggleRace: (raceKey: string) => void;
}

const SavedCrewsList = ({ crewRefs, expandedClubs, toggleClub, expandedRaces, toggleRace }: SavedCrewsListProps) => {
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

    return (
        <Box className="saved-crews-container">
            <Box className="saved-crews-box">
                <Typography variant="h4" className="saved-crews-title">Saved Crews</Typography>

                {Object.entries(groupedCrews).map(([clubName, races]) => (
                    <Box key={clubName} className="club-section">
                        <Button className="toggle-button" onClick={() => toggleClub(clubName)}>
                            {expandedClubs[clubName] ? <ExpandLessIcon /> : <ExpandMoreIcon />} {clubName}
                        </Button>

                        {expandedClubs[clubName] && Object.entries(races).map(([raceName, crews]) => (
                            <Box key={raceName} className="race-section">
                                <Button className="toggle-button race-toggle" onClick={() => toggleRace(`${clubName}-${raceName}`)}>
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
