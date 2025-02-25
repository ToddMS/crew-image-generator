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
}