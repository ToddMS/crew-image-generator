// API response type for saved images
export interface SavedImageResponse {
  id: number;
  imagePath: string;
  imageName: string;
  // Additional properties that may be present
  image_name?: string;
  image_url?: string;
  template_id?: string;
  created_at?: string;
  primary_color?: string;
  secondary_color?: string;
  [key: string]: unknown;
}

// Complete SavedImage type for components
export interface SavedImage {
  id: number;
  crew_id: number;
  user_id: number;
  image_name: string;
  template_id: string;
  primary_color?: string;
  secondary_color?: string;
  image_filename: string;
  image_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  // For backward compatibility with API responses
  imagePath?: string;
  imageName?: string;
}
