export interface BoatType {
    value: string;
    seats: number;
  }

  export interface SavedCrew {
    id: string;
    name: string;
    crewNames: string[];
    boatType: BoatType;
    clubName: string;
    raceName: string;
  }