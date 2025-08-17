import { ApiResponse } from '../types/api.types';
import { Crew } from '../types/crew.types';

const API_CONFIG = {
  baseUrl: 'http://localhost:8080/api',
  endpoints: {
    crews: '/crews',
  },
};

export class ApiService {
  static getAuthHeaders(): Record<string, string> {
    const sessionId = localStorage.getItem('sessionId');
    return sessionId ? { Authorization: `Bearer ${sessionId}` } : {};
  }

  static async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'An error occurred',
          message: data.error,
        };
      }

      return {
        data: data as T,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  static async getCrews(): Promise<ApiResponse<Crew[]>> {
    return this.request<Crew[]>(API_CONFIG.endpoints.crews);
  }

  static async createCrew(crew: Omit<Crew, 'id'>): Promise<ApiResponse<Crew>> {
    return this.request<Crew>(API_CONFIG.endpoints.crews, {
      method: 'POST',
      body: JSON.stringify(crew),
    });
  }

  static async updateCrew(id: string, crew: Crew): Promise<ApiResponse<Crew>> {
    return this.request<Crew>(`${API_CONFIG.endpoints.crews}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(crew),
    });
  }

  static async deleteCrew(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_CONFIG.endpoints.crews}/${id}`, {
      method: 'DELETE',
    });
  }

  static async generateImage(
    crewId: string,
    imageName: string,
    templateId: string,
    colors?: { primary: string; secondary: string },
    clubIcon?: { type: string; file?: File; [key: string]: unknown },
  ): Promise<Blob | null> {
    try {
      const hasFileUpload = clubIcon?.type === 'upload' && clubIcon?.file;

      if (hasFileUpload) {
        const formData = new FormData();
        formData.append('crewId', crewId);
        formData.append('imageName', imageName);
        formData.append('templateId', templateId);

        if (colors) {
          formData.append('colors', JSON.stringify(colors));
        }

        formData.append('clubIconType', 'upload');
        formData.append('clubIconFile', clubIcon.file);

        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.crews}/generate-image`,
          {
            method: 'POST',
            headers: {
              ...this.getAuthHeaders(),
            },
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        return await response.blob();
      } else {
        const payload: Record<string, unknown> = {
          crewId,
          imageName,
          templateId: parseInt(templateId),
          colors,
        };

        if (clubIcon) {
          payload.clubIcon = clubIcon;
        }

        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.crews}/generate-image`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...this.getAuthHeaders(),
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        return await response.blob();
      }
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  }

  static async saveImage(
    crewId: string,
    imageName: string,
    templateId: string,
    colors?: { primary: string; secondary: string },
    imageBlob?: Blob,
  ): Promise<ApiResponse<{ id: number; imagePath: string; imageName: string }>> {
    try {
      const formData = new FormData();
      formData.append('crewId', crewId);
      formData.append('imageName', imageName);
      formData.append('templateId', templateId);

      if (colors) {
        formData.append('colors', JSON.stringify(colors));
      }

      if (imageBlob) {
        formData.append('image', imageBlob, `${imageName}.png`);
      }

      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.crews}/save-image`,
        {
          method: 'POST',
          headers: {
            ...this.getAuthHeaders(),
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'Failed to save image',
          message: data.error,
        };
      }

      return {
        data: data,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred while saving image',
      };
    }
  }

  static async getSavedImages(
    crewId: string,
  ): Promise<ApiResponse<Array<{ id: number; imagePath: string; imageName: string }>>> {
    return this.request<Array<{ id: number; imagePath: string; imageName: string }>>(
      `${API_CONFIG.endpoints.crews}/${crewId}/saved-images`,
    );
  }

  static async deleteSavedImage(imageId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_CONFIG.endpoints.crews}/saved-images/${imageId}`, {
      method: 'DELETE',
    });
  }
}
