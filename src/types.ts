export interface Hotspot {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  title: string;
  description: string;
}

export interface ProjectSection {
  id: string;
  title: string;
  content: string;
}

export interface TechSheet {
  sheetId: string;
  season: string;
  fabricCode: string;
  weight: string;
  composition: string;
  treatment: string;
  specs: { label: string; value: string }[];
  downloadFileName: string;
}

export interface IndustryGarment {
  id: string;
  name: string;
  nameEs?: string;
  refCode: string;
  category: string;
  tags: string[]; // e.g. ["DENIM", "CARGO", "LARGO"], ["DENIM", "CORTO"]
  image: string;
  material?: string;
  silhouette?: string;
  details?: string;
  bentoSpan?: 'wide' | 'tall' | 'standard' | 'large';
  techSheet?: TechSheet;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  modelUrl?: string;
  position: [number, number, number];
  color: string;
  distort?: number;
  sections?: ProjectSection[];
  hotspots?: Record<number, Hotspot[]>; // Maps image index to an array of hotspots
  tags?: string[];
  tools?: string[];
  universe?: 'creative' | 'industry';
  filterTags?: string[]; // available filter tags for submenu
  garments?: IndustryGarment[];
}
