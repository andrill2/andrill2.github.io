/**
 * Shared Type Definitions for STUDIO High-End Portfolio
 */

export interface Project {
  id: string;
  title: string;
  category: 'Web' | 'Identity' | 'Product' | '3D' | string;
  subtitle: string;
  imageUrl: string;
  altText: string;
  year: string;
  description?: string;
  tech?: string[];
  link?: string;
  isCustom?: boolean;
}

export interface Inquiry {
  id: string;
  clientName: string;
  email: string;
  service: string;
  budget: string;
  brief: string;
  timestamp: string;
  aiAnalysis?: string; // Analyzed feedback from Gemini Design Consultant
  aiColorPalette?: { name: string; hex: string }[];
  aiTimeline?: string;
  status: 'Pending' | 'Approved' | 'Archived';
}
