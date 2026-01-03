import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProjectInput, GeneratedPackage, BrandingData, PRDSection } from "../types";

// Schemas for structured output
const prdSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          content: { type: Type.STRING, description: "Content in Markdown format" },
        },
        required: ["id", "title", "content"],
      },
    },
  },
  required: ["sections"],
};

const brandSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    palette: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING, description: "Hex code" },
        secondary: { type: Type.STRING, description: "Hex code" },
        accent: { type: Type.STRING, description: "Hex code" },
        background: { type: Type.STRING, description: "Hex code" },
        text: { type: Type.STRING, description: "Hex code" },
      },
      required: ["primary", "secondary", "accent", "background", "text"],
    },
    typography: {
      type: Type.OBJECT,
      properties: {
        heading: { type: Type.STRING },
        body: { type: Type.STRING },
      },
      required: ["heading", "body"],
    },
    tone: { type: Type.STRING },
    logoPrompt: { type: Type.STRING, description: "A detailed visual prompt to generate a logo for this brand." },
    logoConcepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          paletteSuggestion: { type: Type.STRING },
        },
        required: ["name", "description", "paletteSuggestion"],
      },
      description: "List of 5 distinct logo concepts.",
    },
  },
  required: ["palette", "typography", "tone", "logoPrompt", "logoConcepts"],
};

export const generatePRDText = async (input: ProjectInput): Promise<PRDSection[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Generate a comprehensive Product Requirements Document (PRD) for a project named "${input.name}".
    
    Project Description: ${input.description}
    Target Audience: ${input.audience}
    Desired Style/Vibe: ${input.style}

    The PRD should include the following sections:
    1. Executive Summary
    2. User Personas (Create 3 detailed user personas including demographics, goals, and pain points)
    3. Functional Requirements
    4. Non-Functional Requirements (Security, Performance)
    5. Architecture & Tech Stack (Suggest modern stack)
    6. Visual Design & Wireframe Prompts:
       - Provide detailed image generation prompts for at least 3 key screens (e.g., Landing Page, Dashboard, Mobile View).
       - Each prompt should be descriptive, mentioning layout, colors (based on the '${input.style}' vibe), and UI components, suitable for generating high-fidelity wireframes/mockups using AI image tools.
    7. UI/UX Guidelines (High level)

    Format the content of each section in clean Markdown (using lists, headers, bold text where appropriate).
    Ensure the content is professional, detailed, and actionable for developers.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: prdSchema,
      thinkingConfig: { thinkingBudget: 2048 },
    },
  });

  const json = JSON.parse(response.text || '{"sections": []}');
  return json.sections;
};

export const generateBrandIdentity = async (input: ProjectInput): Promise<BrandingData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Create a brand identity guide for "${input.name}".
    Description: ${input.description}
    Style: ${input.style}
    
    I need:
    1. A color palette (5 colors: primary, secondary, accent, background, text) that matches the '${input.style}' vibe.
    2. Typography recommendations (Heading font and Body font).
    3. A description of the Brand Tone.
    4. A highly detailed, creative image generation prompt for the PRIMARY logo concept. 
       The logo prompt should describe a vector-style, modern logo suitable for an app icon. 
       Mention shapes, colors, and minimalism. Do not include text in the logo image itself.
    5. 5 Distinct Logo Concepts: Generate 5 different directions for the logo (e.g., Abstract, Minimalist, Geometric, Monogram, Masco). Provide a rationale and potential color usage for each.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', 
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: brandSchema,
    },
  });

  return JSON.parse(response.text || '{}');
};

export const generateLogoImage = async (logoPrompt: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Try high-quality model first
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: logoPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    // Fallback if permission denied (likely free tier key) or model unavailable
    if (error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED') || error.status === 403) {
      console.warn("High-quality image generation denied. Falling back to Flash model.");
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: logoPrompt }],
          },
          // Note: gemini-2.5-flash-image does not support imageConfig in the same way, so we omit it
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
      } catch (fallbackError) {
        console.error("Fallback image generation failed:", fallbackError);
      }
    } else {
        console.error("Logo generation failed:", error);
    }
  }
  return undefined;
};

export const generateFullPackage = async (input: ProjectInput): Promise<GeneratedPackage> => {
  const [prd, brandingInit] = await Promise.all([
    generatePRDText(input),
    generateBrandIdentity(input)
  ]);

  const refinedLogoPrompt = `${brandingInit.logoPrompt}. Vector graphic, flat design, white background, high quality, professional app icon.`;
  const logoUrl = await generateLogoImage(refinedLogoPrompt);

  return {
    prd,
    branding: {
      ...brandingInit,
      logoUrl,
    },
  };
};