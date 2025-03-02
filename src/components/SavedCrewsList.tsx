import { useCrewContext } from "../context/CrewContext";
import SavedCrewItem from "./SavedCrewItem";
import { Typography, Box } from "@mui/material";
import { Crew } from "../types/crew.types";
import "../styles/SavedCrewList.css";

interface SavedCrewsListProps {
    crewRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

const SavedCrewsList = ({ crewRefs }: SavedCrewsListProps) => {
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
                        <Typography variant="h5" className="club-title">{clubName}</Typography>

                        {Object.entries(races).map(([raceName, crews]) => (
                            <Box key={raceName} className="race-section">
                                <Typography variant="h6" className="race-title">{raceName}</Typography>

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
