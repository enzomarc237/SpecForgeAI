export interface ProjectInput {
  name: string;
  description: string;
  audience: string;
  style: string;
}

export interface PRDSection {
  id: string;
  title: string;
  content: string; // Markdown formatted text
}

export interface BrandPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface LogoConcept {
  name: string;
  description: string;
  paletteSuggestion: string;
}

export interface BrandingData {
  palette: BrandPalette;
  typography: {
    heading: string;
    body: string;
  };
  tone: string;
  logoPrompt: string;
  logoConcepts: LogoConcept[];
  logoUrl?: string; // Base64 data URI
}

export interface GeneratedPackage {
  prd: PRDSection[];
  branding: BrandingData;
}

export enum AppStep {
  INPUT = 'INPUT',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
}