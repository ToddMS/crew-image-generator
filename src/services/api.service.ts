import { ApiResponse } from '../types/api.types';
import { Crew } from '../types/crew.types';

const API_CONFIG = {
  baseUrl: 'http://localhost:8080/api',
  endpoints: {
    crews: '/crews'
  }
};

export class ApiService {
  static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'An error occurred',
          message: data.error
        };
      }

      return {
        data: data as T
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  }

  static async getCrews(): Promise<ApiResponse<Crew[]>> {
    return this.request<Crew[]>(API_CONFIG.endpoints.crews);
  }

  static async createCrew(crew: Omit<Crew, 'id'>): Promise<ApiResponse<Crew>> {
    return this.request<Crew>(API_CONFIG.endpoints.crews, {
      method: 'POST',
      body: JSON.stringify(crew)
    });
  }

  static async updateCrew(id: string, crew: Crew): Promise<ApiResponse<Crew>> {
    return this.request<Crew>(`${API_CONFIG.endpoints.crews}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(crew)
    });
  }

  static async deleteCrew(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_CONFIG.endpoints.crews}/${id}`, {
      method: 'DELETE'
    });
  }
}