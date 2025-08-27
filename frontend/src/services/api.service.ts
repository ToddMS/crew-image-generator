import { ApiResponse } from '../types/api.types';
import { Crew } from '../types/crew.types';
import { ClubPreset } from '../types/club.types';
import { SavedImageResponse } from '../types/image.types';

const API_CONFIG = {
  baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api`,
  endpoints: {
    crews: '/crews',
    clubPresets: '/club-presets',
    templates: '/templates',
    generate: '/generate-images',
  },
};

type JsonObject = Record<string, unknown>;

interface GenerationImage {
  format: string;
  url: string;
  size: string;
}

interface GenerationResult {
  id: string;
  status: 'completed' | 'pending' | 'failed';
  progress: number;
  images: GenerationImage[];
}

export class ApiService {
  static getAuthHeaders(): Record<string, string> {
    const sessionId = localStorage.getItem('sessionId');
    return sessionId ? { Authorization: `Bearer ${sessionId}` } : {};
  }

  static async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const fullUrl = `${API_CONFIG.baseUrl}${endpoint}`;

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
      });

      // Handle different content types
      let data: unknown;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        // For non-JSON responses, create a simple error structure
        data = { message: textData };
      }

      if (!response.ok) {
        const parsed = data as { message?: string; error?: string } | string | unknown;
        const message =
          typeof parsed === 'object' && parsed !== null
            ? (parsed as { message?: string }).message
            : undefined;
        const errorField =
          typeof parsed === 'object' && parsed !== null
            ? (parsed as { error?: string }).error
            : undefined;
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          message: message || errorField || 'Request failed',
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
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
    options?: {
      templateId?: string;
      templateConfig?: unknown;
      imageName?: string;
      colors?: { primary: string; secondary: string };
      clubIcon?: { type: string; file?: File; [key: string]: unknown };
    },
  ): Promise<ApiResponse<JsonObject>> {
    try {
      const { templateId, templateConfig, imageName, colors, clubIcon } = options || {};
      const hasFileUpload = clubIcon?.type === 'upload' && clubIcon?.file;

      if (hasFileUpload) {
        const formData = new FormData();
        formData.append('crewId', crewId);
        if (imageName) formData.append('imageName', imageName);
        if (templateId) formData.append('templateId', templateId);
        if (templateConfig) formData.append('templateConfig', JSON.stringify(templateConfig));

        if (colors) {
          formData.append('colors', JSON.stringify(colors));
        }

        formData.append('clubIconType', 'upload');
        if (clubIcon.file instanceof File) {
          formData.append('clubIconFile', clubIcon.file);
        }

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
          const error = await response.text();
          return { success: false, error: error || 'Failed to generate image' };
        }

        const data = (await response.json()) as JsonObject;
        return { success: true, data };
      } else {
        const payload: Record<string, unknown> = {
          crewId,
          imageName,
          templateId,
          templateConfig,
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
          const error = await response.text();
          return { success: false, error: error || 'Failed to generate image' };
        }

        const data = (await response.json()) as JsonObject;
        return { success: true, data };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
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

      const data = (await response.json()) as
        | { id: number; imagePath: string; imageName: string }
        | { message?: string; error?: string };

      if (!response.ok) {
        const err = data as { message?: string; error?: string };
        return {
          success: false,
          error: err.message || 'Failed to save image',
          message: err.error,
        };
      }

      return {
        success: true,
        data: data as { id: number; imagePath: string; imageName: string },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while saving image',
      };
    }
  }

  static async getSavedImages(): Promise<ApiResponse<SavedImageResponse[]>> {
    try {
      const response = await this.request<SavedImageResponse[]>('/crews/saved-images');
      if (response.error) {
        // If the endpoint doesn't exist (404), return empty array instead of error
        if (response.error.includes('404') || response.error.includes('Not Found')) {
          return { success: true, data: [] };
        }
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load images',
      };
    }
  }

  static async deleteSavedImage(imageId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.request<void>(`/crews/saved-images/${imageId}`, {
        method: 'DELETE',
      });
      if (response.error) {
        return { success: false, error: response.error };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete image',
      };
    }
  }

  // Template methods
  static async getTemplates(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>(API_CONFIG.endpoints.templates);
  }

  static async createTemplate(template: JsonObject): Promise<ApiResponse<JsonObject>> {
    return this.request<JsonObject>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  static async updateTemplate(
    id: string,
    template: Partial<JsonObject>,
  ): Promise<ApiResponse<JsonObject>> {
    return this.request<JsonObject>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  static async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  // User profile methods
  static async updateProfile(profile: JsonObject): Promise<ApiResponse<JsonObject>> {
    return this.request<JsonObject>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  static async updateClubSettings(settings: JsonObject): Promise<ApiResponse<JsonObject>> {
    return this.request<JsonObject>('/user/club-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  static async updatePreferences(preferences: JsonObject): Promise<ApiResponse<JsonObject>> {
    return this.request<JsonObject>('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  static async uploadLogo(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${API_CONFIG.baseUrl}/user/upload-logo`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
        },
        body: formData,
      });

      const data = (await response.json()) as
        | { url: string }
        | { message?: string; error?: string };

      if (!response.ok) {
        const err = data as { message?: string; error?: string };
        return {
          success: false,
          error: err.message || 'Failed to upload logo',
          message: err.error,
        };
      }

      return {
        success: true,
        data: data as { url: string },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while uploading logo',
      };
    }
  }

  // Statistics and analytics methods
  static async getDashboardStats(): Promise<ApiResponse<JsonObject>> {
    return this.request<JsonObject>('/dashboard/stats');
  }

  static async getRecentActivity(): Promise<ApiResponse<JsonObject[]>> {
    return this.request<JsonObject[]>('/dashboard/recent-activity');
  }

  // Club Preset methods
  static async getClubPresets(): Promise<ApiResponse<ClubPreset[]>> {
    return this.request<ClubPreset[]>(API_CONFIG.endpoints.clubPresets);
  }

  static async createClubPreset(preset: Omit<ClubPreset, 'id'>): Promise<ApiResponse<ClubPreset>> {
    return this.request<ClubPreset>(API_CONFIG.endpoints.clubPresets, {
      method: 'POST',
      body: JSON.stringify(preset),
    });
  }

  static async updateClubPreset(
    id: number,
    preset: Partial<ClubPreset>,
  ): Promise<ApiResponse<ClubPreset>> {
    return this.request<ClubPreset>(`${API_CONFIG.endpoints.clubPresets}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(preset),
    });
  }

  static async deleteClubPreset(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_CONFIG.endpoints.clubPresets}/${id}`, {
      method: 'DELETE',
    });
  }

  // Image Generation methods
  static async generateImages(request: {
    crewId: string;
    templateId: string;
    colors: { primary: string; secondary: string };
    formats: string[];
  }): Promise<ApiResponse<GenerationResult>> {
    // Use the existing crews/generate-image endpoint
    const payload = {
      crewId: request.crewId,
      templateId: request.templateId,
      colors: request.colors,
      imageName: `crew-${request.crewId}-${Date.now()}`,
    };

    try {
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
        const errorText = await response.text();
        return { success: false, error: errorText || 'Failed to generate image' };
      }

      // Check if the response is actually an image (PNG)
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('image')) {
        // The backend returns the image buffer directly
        const imageBlob = await response.blob();

        // Create a mock generation status response
        const mockResponse: GenerationResult = {
          id: `gen-${Date.now()}`,
          status: 'completed' as const,
          progress: 100,
          images: [
            {
              format: request.formats[0] || 'instagram_post',
              url: URL.createObjectURL(imageBlob),
              size: '1080x1080',
            },
          ],
        };

        return { success: true, data: mockResponse };
      } else {
        // Try to parse as JSON in case there's an error message
        try {
          const jsonData = (await response.json()) as { error?: string };
          return { success: false, error: jsonData.error || 'Unknown error from server' };
        } catch {
          const textData = await response.text();
          return { success: false, error: textData || 'Unknown error from server' };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image',
      };
    }
  }

  static async getGenerationStatus(generationId: string): Promise<ApiResponse<GenerationResult>> {
    return {
      success: true,
      data: {
        id: generationId,
        status: 'completed',
        progress: 100,
        images: [],
      },
    };
  }
}
