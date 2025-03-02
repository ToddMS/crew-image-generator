import React, { createContext, useContext, useState, useCallback } from "react";
import { Crew, BoatType } from "../types/crew.types";
import { getCrews, createCrew, updateCrew, deleteCrew } from "../services/BoatService";

interface CrewContextType {
    crews: Crew[];
    selectedBoat: BoatType | null;
    editingCrew: Crew | null; 
    loading: boolean;
    error: string | null;
    fetchCrews: () => Promise<void>;
    addCrew: (crew: Omit<Crew, "id">) => Promise<void>;
    updateCrew: (id: string, crew: Crew) => Promise<void>;
    deleteCrew: (id: string) => Promise<void>;
    setEditingCrew: (crew: Crew | null) => void; 
    setSelectedBoat: (boat: BoatType | null) => void;
    clearError: () => void;
}

const CrewContext = createContext<CrewContextType | undefined>(undefined);

export const CrewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [crews, setCrews] = useState<Crew[]>([]);
    const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);
    const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCrews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedCrews = await getCrews();
            setCrews(fetchedCrews);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch crews");
        } finally {
            setLoading(false);
        }
    }, []);

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

    const handleUpdateCrew = useCallback(async (id: string, crew: Crew) => {
        setLoading(true);
        setError(null);
        try {
            await updateCrew(id, crew);
            await fetchCrews();
            setEditingCrew(null); 
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update crew");
        } finally {
            setLoading(false);
        }
    }, [fetchCrews]);

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

    const clearError = () => setError(null);

    return (
        <CrewContext.Provider value={{ 
            crews, 
            selectedBoat, 
            editingCrew,
            loading, 
            error, 
            fetchCrews, 
            addCrew, 
            updateCrew: handleUpdateCrew, 
            deleteCrew: handleDeleteCrew, 
            setEditingCrew,  
            setSelectedBoat, 
            clearError 
        }}>
            {children}
        </CrewContext.Provider>
    );
};

export const useCrewContext = () => {
    const context = useContext(CrewContext);
    if (!context) {
        throw new Error("useCrewContext must be used within a CrewProvider");
    }
    return context;
};

