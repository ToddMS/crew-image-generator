export interface BoatType {
  id: number;
  value: string;
  seats: number;
  name: string;
}

export interface Crew {
  id: string;
  name: string;
  crewNames: string[];
  boatType: BoatType;
  clubName: string;
  raceName: string;
  // Additional properties that may exist in API responses
  boatClub?: string;
  boatName?: string;
  boatClass?: string;
  crewMembers?: Array<{ seat: string; name: string }>;
  coachName?: string;
  [key: string]: unknown;
}

export interface Template {
  id: number;
  image: string;
}
