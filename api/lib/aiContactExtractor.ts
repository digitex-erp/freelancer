import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const gemini = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface ContactInfo {
  email: string | null;
  phone: string | null;
  company: string | null;
  name: string | null;
}

export async function extractContactsWithAI(description: string, title: string): Promise<ContactInfo> {
  if (!gemini) {
    console.warn("No API_KEY found for Gemini extraction");
    return { email: null, phone: null, company: null, name: null };
  }

  const prompt = `
    Extract contact details from this job posting.
    
    Title: ${title}
    Content: ${description.substring(0, 5000)}

    Return JSON ONLY:
    {
      "email": "string or null",
      "phone": "string or null",
      "company": "string or null",
      "name": "contact person name or null"
    }
  `;

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) return { email: null, phone: null, company: null, name: null };
    
    return JSON.parse(text);
  } catch (e) {
    console.error("AI Extraction Failed:", e);
    return { email: null, phone: null, company: null, name: null };
  }
}