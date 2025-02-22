import React, { createContext, useContext, useState, useCallback } from "react";
import { Crew, BoatType } from "../types/crew.types";
import { getCrews, createCrew, updateCrew, deleteCrew } from "../services/BoatService";

// Define the type for the context
interface CrewContextType {
    crews: Crew[];
    selectedBoat: BoatType | null;
    editingCrew: Crew | null; // ✅ Track the crew being edited
    loading: boolean;
    error: string | null;
    fetchCrews: () => Promise<void>;
    addCrew: (crew: Omit<Crew, "id">) => Promise<void>;
    updateCrew: (id: string, crew: Crew) => Promise<void>;
    deleteCrew: (id: string) => Promise<void>;
    editCrew: (id: string) => void; // ✅ Sets a crew for editing
    setSelectedBoat: (boat: BoatType | null) => void;
    clearError: () => void;
}

// ✅ Create context
const CrewContext = createContext<CrewContextType | undefined>(undefined);

// ✅ Provider component
export const CrewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [crews, setCrews] = useState<Crew[]>([]);
    const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);
    const [editingCrew, setEditingCrew] = useState<Crew | null>(null); // ✅ Track which crew is being edited
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCrews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedCrews = await getCrews();
            console.log("Fetched crews:", fetchedCrews); // ✅ Debugging log
            setCrews(fetchedCrews);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch crews");
        } finally {
            setLoading(false);
        }
    }, []);
    

    // Add a crew
    const addCrew = useCallback(async (crew: Omit<Crew, "id">) => {
        setLoading(true);
        setError(null);
        try {
            await createCrew(crew);
            await fetchCrews();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add crew");
        } finally {
            setLoading(false);
        }
    }, [fetchCrews]);

    // Update a crew
    const handleUpdateCrew = useCallback(async (id: string, crew: Crew) => {
        setLoading(true);
        setError(null);
        try {
            await updateCrew(id, crew);
            await fetchCrews();
            setEditingCrew(null); // ✅ Clear editing state after update
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update crew");
        } finally {
            setLoading(false);
        }
    }, [fetchCrews]);

    // Delete a crew
    const handleDeleteCrew = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await deleteCrew(id);
            await fetchCrews();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete crew");
        } finally {
            setLoading(false);
        }
    }, [fetchCrews]);

    const handleEditCrew = (id: string) => {
        console.log("Editing crew ID:", id); // ✅ Debugging log
        console.log("Current crews:", crews); // ✅ Debugging log
    
        const crewToEdit = crews.find((crew) => crew.id === id);
        
        if (!crewToEdit) {
            console.error(`Crew with ID ${id} not found.`);
            return;
        }
    
        setEditingCrew(crewToEdit);
        setSelectedBoat(crewToEdit.boatType);
    };
    

    const clearError = () => setError(null);

    return (
        <CrewContext.Provider value={{ 
            crews, 
            selectedBoat, 
            editingCrew, // ✅ Provide the editing crew 
            loading, 
            error, 
            fetchCrews, 
            addCrew, 
            updateCrew: handleUpdateCrew, 
            deleteCrew: handleDeleteCrew, 
            editCrew: handleEditCrew, // ✅ Provide editCrew
            setSelectedBoat, 
            clearError 
        }}>
            {children}
        </CrewContext.Provider>
    );
};

// ✅ Hook to use CrewContext
export const useCrewContext = () => {
    const context = useContext(CrewContext);
    if (!context) {
        throw new Error("useCrewContext must be used within a CrewProvider");
    }
    return context;
};

// ✅ Export CrewContext
export { CrewContext };
