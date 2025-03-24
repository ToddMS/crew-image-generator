import { useCrewContext } from "../context/CrewContext";
import SavedCrewItem from "./SavedCrewItem";
import { Typography, Box } from "@mui/material";
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
    onSelectCrew: (crew: Crew) => void;
    selectedCrew: Crew | null;
}

const SavedCrewsList = ({ 
    expandedClubs, 
    setExpandedClubs, 
    expandedRaces, 
    setExpandedRaces,
    onSelectCrew,
    selectedCrew
}: SavedCrewsListProps) => {
    const { crews } = useCrewContext();

    const groupedCrews = crews.reduce((acc, crew) => {
        if (!acc[crew.clubName]) acc[crew.clubName] = {};
        if (!acc[crew.clubName][crew.raceName]) acc[crew.clubName][crew.raceName] = [];
        acc[crew.clubName][crew.raceName].push(crew);
        return acc;
    }, {} as Record<string, Record<string, Crew[]>>);

    const handleToggleClub = (clubName: string) => {
        setExpandedClubs((prev) => {
            const isExpanding = !prev[clubName];
            const newState = { ...prev, [clubName]: isExpanding };

            if (!isExpanding) {
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
        setExpandedRaces((prev) => ({
            ...prev,
            [`${clubName}-${raceName}`]: !prev[`${clubName}-${raceName}`],
        }));
    };

    return (
        <Box className="saved-crews-container">
            <Box className="saved-crews-box">
                <Typography variant="h4" className="saved-crews-title">Saved Crews</Typography>

                {Object.entries(groupedCrews).map(([clubName, races]) => (
                    <Box key={clubName} className="club-section">
                        <Box className="toggle-button" onClick={() => handleToggleClub(clubName)}>
                            {expandedClubs[clubName] ? <ExpandLessIcon /> : <ExpandMoreIcon />} {clubName}
                        </Box>

                        {expandedClubs[clubName] && Object.entries(races).map(([raceName, crews]) => (
                            <Box key={raceName} className="race-section">
                                <Box className="toggle-button race-toggle" onClick={() => handleToggleRace(clubName, raceName)}>
                                    {expandedRaces[`${clubName}-${raceName}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />} {raceName}
                                </Box>

                                {expandedRaces[`${clubName}-${raceName}`] && (
                                <Box className="crew-grid">
                                    {crews.map((crew) => (
                                        <Box 
                                            key={crew.id} 
                                            className={`crew-item ${selectedCrew?.id === crew.id ? "selected" : ""}`}
                                            onClick={() => onSelectCrew(crew)}
                                        >
                                            <SavedCrewItem crew={crew} />
                                        </Box>
                                    ))}
                                </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default SavedCrewsList;
