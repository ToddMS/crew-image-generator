import { ApiService } from './api.service';
import { Crew } from '../types/crew.types';

export const getCrews = async (): Promise<Crew[]> => {
  const response = await ApiService.getCrews();
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data || [];
};

export const createCrew = async (crew: Omit<Crew, 'id'>): Promise<Crew> => {
  const response = await ApiService.createCrew(crew);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data!;
};

export const updateCrew = async (id: string, crew: Crew): Promise<Crew> => {
  const response = await ApiService.updateCrew(id, crew);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data!;
};

export const deleteCrew = async (id: string): Promise<void> => {
  const response = await ApiService.deleteCrew(id);
  if (response.error) {
    throw new Error(response.error);
  }
};
