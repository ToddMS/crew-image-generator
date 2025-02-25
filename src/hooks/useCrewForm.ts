import { useState, useCallback } from 'react';
import { Crew, BoatType } from '../types/crew.types';

interface CrewFormData {
    clubName: string;
    raceName: string;
    boatName: string;
    crewNames: string[];
    selectedBoat: BoatType | null;
}

interface CrewFormErrors {
    clubName?: string;
    raceName?: string;
    boatName?: string;
    crewNames?: string[];
    selectedBoat?: string;
}

export const useCrewForm = (initialData?: Crew) => {
    const [formData, setFormData] = useState<CrewFormData>({
        clubName: initialData?.clubName || '',
        raceName: initialData?.raceName || '',
        boatName: initialData?.name || '',
        crewNames: initialData?.crewNames || [],
        selectedBoat: initialData?.boatType || null
    });

    const [errors, setErrors] = useState<CrewFormErrors>({});

    const validateForm = useCallback((): boolean => {
        const newErrors: CrewFormErrors = {};

        if (!formData.clubName.trim()) {
            newErrors.clubName = 'Club name is required';
        }

        if (!formData.raceName.trim()) {
            newErrors.raceName = 'Race name is required';
        }

        if (!formData.boatName.trim()) {
            newErrors.boatName = 'Boat name is required';
        }

        if (!formData.selectedBoat) {
            newErrors.selectedBoat = 'Boat type is required';
        }

        const hasEmptyCrewNames = formData.crewNames.some(name => !name.trim());
        if (hasEmptyCrewNames) {
            newErrors.crewNames = ['All crew member names are required']; 
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleInputChange = useCallback((
        field: keyof CrewFormData,
        value: string | string[] | BoatType | null
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for the field being updated
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    }, [errors]);

    const handleSubmit = useCallback(async (onSubmit: (data: CrewFormData) => Promise<void>) => {
        if (validateForm()) {
            try {
                await onSubmit(formData);
                return true;
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    submit: 'Failed to submit form'
                }));
                return false;
            }
        }
        return false;
    }, [formData, validateForm]);

    const resetForm = useCallback(() => {
        setFormData({
            clubName: '',
            raceName: '',
            boatName: '',
            crewNames: [],
            selectedBoat: null
        });
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        handleInputChange,
        handleSubmit,
        resetForm,
        isValid: validateForm
    };
};