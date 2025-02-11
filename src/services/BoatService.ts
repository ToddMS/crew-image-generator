import { SavedCrew, BoatType } from '../types';

let savedCrews: SavedCrew[] = [];

export const getCrews = () => savedCrews;

export const createCrew = (boat: BoatType, crewNames: string[], crewName: string, clubName: string, raceName: string): SavedCrew => {
    return {
        id: Date.now().toString(),
        name: crewName,
        crewNames: crewNames,
        boatType: boat,
        clubName: clubName,
        raceName: raceName,
    };
};

export const addCrew = (newCrew: SavedCrew) => {
    savedCrews = [...savedCrews, newCrew];
};

export const updateCrew = (updatedCrew: SavedCrew) => {
    savedCrews = savedCrews.map(crew => 
        crew.id === updatedCrew.id ? updatedCrew : crew
    );
};

export const deleteCrew = (crewId: string) => {
    savedCrews = savedCrews.filter(crew => crew.id !== crewId);
};

export const getSeatLabel = (boatType: string, index: number, totalSeats: number) => {
    if (boatType === '1x') return 'Rower';
    
    const hasCox = boatType.includes('+');

    const seatNumber = totalSeats - index + (hasCox ? 1 : 0);

    if (seatNumber === totalSeats) return 'Stroke';
    if (seatNumber === 1) return 'Bow';
    return `Seat ${seatNumber}`;
};





