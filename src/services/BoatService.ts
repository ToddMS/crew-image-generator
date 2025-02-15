import { SavedCrew, BoatType } from '../types';

let savedCrews: SavedCrew[] = [];

export const getCrews = () => savedCrews;

export const createCrew = (
  boat: BoatType, 
  crewNames: string[], 
  crewName: string, 
  clubName: string, 
  raceName: string
): SavedCrew => {
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

export const getSeatLabel = (boatType: string, index: number, totalRowers: number): string => {
    const hasCox = boatType.includes('+');
    
    if (hasCox && index === 0) {
      return 'Cox';
    }
    
    const adjustedIndex = hasCox ? index - 1 : index;
    
    if (adjustedIndex === 0) {
      return 'Stroke';
    }
    
    if (adjustedIndex === totalRowers - 1) {
      return 'Bow';
    }
    
    return `${totalRowers - adjustedIndex}`;
  };