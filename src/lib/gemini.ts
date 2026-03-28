import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey! });

export const generateLocationDetails = async (name: string, type: 'attraction' | 'hotel', city: string) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate travel information in Vietnamese for a ${type} in ${city} named "${name}". 
  Provide:
  1. A short description (max 150 characters) in Vietnamese.
  2. A long, detailed description (3-4 paragraphs, engaging travel guide style) in Vietnamese.
  3. A list of 4-5 high-quality image URLs from Unsplash that would represent this place. 
     Use keywords like "${name} ${city}" for the search.
     Use the format: https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=1200&q=80
  4. Typical opening hours (if attraction) or location area (if hotel) in Vietnamese.
  5. Estimated price (e.g. "~180 CNY" or "Miễn phí") in Vietnamese.
  
  Return the response in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          longDescription: { type: Type.STRING },
          galleryImages: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          hours: { type: Type.STRING },
          price: { type: Type.STRING },
          location: { type: Type.STRING }
        },
        required: ["description", "longDescription", "galleryImages"]
      }
    }
  });

  return JSON.parse(response.text);
};
