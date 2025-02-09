import { SavedCrew, BoatType } from '../types';

let savedCrews: SavedCrew[] = [];

export const getCrews = () => savedCrews;

export const createCrew = (boat: BoatType, crewNames: string[]): SavedCrew => {
    return {
        id: Date.now().toString(),
        name: `Crew for ${boat.value}`,
        crewNames,
        boatType: boat,
    };
};

export const addCrew = (newCrew: SavedCrew) => {
    savedCrews = [...savedCrews, newCrew];
};

export const updateCrew = (updatedCrew: SavedCrew) => {
    savedCrews = savedCrews.map(crew => 
        crew.id === updatedCrew.id ? updatedCrew : crew
    );
    console.log(savedCrews);
};

export const deleteCrew = (crewId: string) => {
    savedCrews = savedCrews.filter(crew => crew.id !== crewId);
};

export const getSeatLabel = (boatType: string, index: number, totalSeats: number) => {
  const hasCox = boatType.includes('+');
  const actualTotalSeats = hasCox ? totalSeats - 1 : totalSeats;

  if (hasCox && index === 0) {
      return 'Cox';
  }

  const seatNumber = actualTotalSeats - index;

  if (seatNumber === actualTotalSeats) {
      return 'Stroke';
  } else if (seatNumber === 0) {
      return 'Bow';
  }

  return `Seat ${seatNumber}`;
};

