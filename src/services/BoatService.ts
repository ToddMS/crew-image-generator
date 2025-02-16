import { SavedCrew } from "../types";

const API_URL = "http://localhost:8080/api/crews";

export const getCrews = async (): Promise<SavedCrew[]> => {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error(`Failed to fetch crews: ${response.status} ${response.statusText}`);

        return await response.json();
    } catch (error) {
        console.error("Error fetching crews:", error);
        return [];
    }
};

export const createCrew = async (crew: {
  name: string;
  crewNames: string[];
  boatType: string;
  clubName: string;
  raceName: string;
}): Promise<SavedCrew | null> => {
  try {
      const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(crew),
      });

      const data = await response.json(); // Read response JSON before error checking

      if (!response.ok) throw new Error(`Failed to create crew: ${response.status} ${data?.message || response.statusText}`);

      return data;
  } catch (error) {
      console.error("Error creating crew:", error);
      return null;
  }
};


export const updateCrew = async (id: string, updatedCrew: Partial<SavedCrew>): Promise<SavedCrew | null> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCrew),
        });

        if (!response.ok) throw new Error("Failed to update crew");
        return await response.json();
    } catch (error) {
        console.error("Error updating crew:", error);
        return null;
    }
};

export const deleteCrew = async (crewId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/${crewId}`, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete crew");
    } catch (error) {
        console.error("Error deleting crew:", error);
    }
};
