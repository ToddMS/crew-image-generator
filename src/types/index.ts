export interface BoatType {
  value: string;
  seats: number;
  name: string;
}

export interface SavedCrew {
  id: string;
  name: string;
  crewNames: string[];
  boatType: BoatType;
  clubName: string;
  raceName: string;
}