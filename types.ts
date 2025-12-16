export enum UnitType {
  CABINET_DOOR = 'CABINET_DOOR', // Standard cabinet
  DRAWERS = 'DRAWERS',
  OPEN_SHELF = 'OPEN_SHELF', // Explicitly open
  TV_SPACE = 'TV_SPACE',
  CORNER = 'CORNER'
}

export interface Texture {
  id: string;
  name: string;
  cssValue: string; // Background style
  boardColor: string; // The color of the edge banding/cut surface
  innerColor: string; // Darker shade for inside the cabinet (creates depth)
}

export interface UnitConfig {
  id: string;
  name: string;
  type: UnitType;
  
  // Logic Props
  width: number;
  isElastic: boolean;
  
  // Vertical Logic
  hasTopCabinet?: boolean;
  topCabinetHeight?: number;
  
  // Visual & Structural Props
  textureId: string;
  shelfCount?: number; // New: Number of internal shelves
  hasDoor?: boolean;   // New: Toggle door on/off to see inside
  doorStyle?: 'flat' | 'shaker' | 'glass';
}

export interface SolutionConfig {
  name?: string;
  layoutMode?: 'linear' | 'L_shape';
  totalWidth: number;
  height: number;
  depth: number;
  units: UnitConfig[];
}

export interface Scenario {
  id: string;
  name: string;
  config: SolutionConfig;
}