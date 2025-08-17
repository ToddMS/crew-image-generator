export interface ClubPreset {
  id: number;
  club_name: string;
  primary_color: string;
  secondary_color: string;
  logo_filename?: string;
  is_default: boolean;
  [key: string]: unknown;
}