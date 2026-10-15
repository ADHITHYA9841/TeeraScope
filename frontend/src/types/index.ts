export interface DamageBreakdownItem {
  count: number;
  percentage: number;
  color: string;
}

export interface DamageBreakdown {
  no_damage: DamageBreakdownItem;
  minor_damage: DamageBreakdownItem;
  major_damage: DamageBreakdownItem;
  destroyed: DamageBreakdownItem;
}

export interface BuildingPrediction {
  id: string;
  damage_class: string;
  damage_severity: number;
  color: string;
  confidence: number;
  area_px: number;
  bbox: [number, number, number, number];
  centroid: [number, number];
  probabilities: Record<string, number>;
  pre_snippet: string;
  post_snippet: string;
}

export interface InferenceResults {
  assessment_id: string;
  image_dimensions: [number, number];
  processed_dimensions: [number, number];
  duration_seconds: number;
  total_buildings: number;
  assessed_area_sqm: number;
  damage_breakdown: DamageBreakdown;
  overlay_url: string;
  mask_url: string;
  buildings: BuildingPrediction[];
  model_info: {
    name: string;
    device: string;
    weights_source: string;
  };
}

export interface Assessment {
  id: string;
  name: string;
  disaster_type: string;
  event_date?: string;
  location?: string;
  notes?: string;
  pre_image_path: string;
  post_image_path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  error_message?: string;
  created_at: string;
  duration_seconds: number;
  total_buildings: number;
  no_damage_count: number;
  minor_damage_count: number;
  major_damage_count: number;
  destroyed_count: number;
  assessed_area_sqm: number;
  results?: InferenceResults | null;
}

export interface ModelStatus {
  is_loaded: boolean;
  device: string;
  model_architecture: string;
  localization_stage: string;
  classification_stage: string;
  weights_source: string;
  weights_file_found: boolean;
  weights_path: string;
}

export interface SampleDataset {
  name: string;
  disaster_type: string;
  location: string;
  pre_image_path: string;
  post_image_path: string;
}
