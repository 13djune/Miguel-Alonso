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
}
