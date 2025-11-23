import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { Anthropic } from "@anthropic-ai/sdk";

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ANTH_KEY   = process.env.ANTHROPIC_API_KEY;

const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;
const anthropic = ANTH_KEY ? new Anthropic({ apiKey: ANTH_KEY }) : null;
const gemini = GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null;

function timeout(ms: number) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

// Robust extractor for various AI SDK response shapes
export function extractText(resp: any): string {
  if (!resp) return '';
  if (typeof resp === 'string') return resp;

  try {
    // Google GenAI v2.5+ .text accessor
    if (typeof resp.text === 'string') return resp.text;
    if (typeof resp.text === 'function') return resp.text(); 

    // Google GenAI Legacy / deeply nested candidates
    if (resp.candidates?.[0]?.content?.parts?.[0]?.text) {
        return resp.candidates[0].content.parts[0].text;
    }

    // OpenAI / DeepSeek / Compatible
    if (Array.isArray(resp.choices) && resp.choices.length) {
        const c = resp.choices[0];
        if (c?.message?.content) return c.message.content;
        if ((c as any)?.text) return (c as any).text;
    }

    // Anthropic
    if (Array.isArray(resp.content)) {
        return resp.content.map((c: any) => c?.text || '').join('');
    }
    if (resp.content && typeof resp.content.text === 'string') {
        return resp.content.text;
    }

    // Fallback for generic objects
    if (typeof resp.output === 'string') return resp.output;

  } catch (e) { 
    console.warn("Text extraction failed safely", e);
  }
  
  // Last resort: JSON stringify
  try { return JSON.stringify(resp); } catch { return ''; }
}

export async function analyzeLeadAI(input: string) {
  const providers = [
    async () => {
      if (!gemini) throw new Error("no-gemini");
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: input,
        config: {
            responseMimeType: "application/json"
        }
      });
      const txt = extractText(response);
      if (!txt) throw new Error("gemini-no-text");
      return JSON.parse(txt);
    },

        async () => {
      if (!anthropic) throw new Error('no-anthropic');
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: input }]
      });
      const txt = extractText(msg);
      return JSON.parse(txt || '{}');
    },
    async () => {
      if (!anthropic) throw new Error('no-anthropic');
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });
      const txt = extractText(msg);
      return JSON.parse(txt || '{}');
    },
async () => {
      if (!openai) throw new Error("no-openai");
      const r = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.1,
        messages: [{ role: "user", content: input }],
        response_format: { type: "json_object" }
      });
      const txt = extractText(r);
      return JSON.parse(txt || '{}');
    }
  ];

  let lastErr: any = null;

  for (const provider of providers) {
    try {
      return await Promise.race([provider(), timeout(12000)]);
    } catch (err: any) {
      lastErr = err;
      continue;
    }
  }

  return {
    score: 0,
    category: "other",
    reasoning: "All providers failed: " + (lastErr?.message || "unknown"),
    contacts: {},
    export_metadata: {}
  };
}

export async function generatePitchAI(context: string, templateType: string) {
  const prompt = `
    You are an expert sales agent for Bell24h (Vishal Pendharkar).
    Write a professional cold email based on this context.
    
    Context:
    ${context}
    
    Style: ${templateType} (e.g., 'distributor', 'manufacturer', 'freelance_dev', 'en590_broker')
    
    Key Personas:
    - Fabric Mfg: "25 years legacy in Bhiwandi, Sample Book Specialist".
    - Freelance: "Web Automation & AI Expert".
    - EN590: "Commission-based Intermediary".

    Return JSON: { "subject": "...", "body": "..." }
  `;

  const providers = [
    async () => {
      if (!gemini) throw new Error("no-gemini");
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const txt = extractText(response);
      return JSON.parse(txt || '{}');
    },
        async () => {
      if (!anthropic) throw new Error('no-anthropic');
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: input }]
      });
      const txt = extractText(msg);
      return JSON.parse(txt || '{}');
    },
    async () => {
      if (!anthropic) throw new Error('no-anthropic');
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });
      const txt = extractText(msg);
      return JSON.parse(txt || '{}');
    },
async () => {
      if (!openai) throw new Error("no-openai");
      const r = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      const txt = extractText(r);
      return JSON.parse(txt || '{}');
    }
  ];

  for (const provider of providers) {
    try { return await provider(); } catch (e) {}
  }
  return { subject: "Inquiry", body: "Error generating pitch." };
}
