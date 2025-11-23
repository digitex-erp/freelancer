import { analyzeLeadAI } from "./multiAI";
import { extractContacts } from "./contactExtract";

export type ExportMetadata = {
  product?: string | null;
  hs_code?: string | null;
  qty?: string | null;
  unit?: string | null;
  country?: string | null;
  port?: string | null;
  incoterm?: string | null;
  certifications?: string[] | null;
  buyer_type?: "government" | "distributor" | "importer" | "trader" | "unknown" | null;
  target_price_per_unit?: string | null;
  packaging?: string | null;
  raw_text?: string | null;
  lead_source?: string | null;
  has_loi_icpo?: boolean | null;
};

export type ClassifierResult = {
  success: boolean;
  exported_at: string;
  category: "export_trade" | "fabric" | "en590" | "freelance" | "other";
  reasoning: string;
  exportMetadata: ExportMetadata;
  contacts: { name?: string | null; email?: string | null; phone?: string | null; };
  export_score: number;
  quality: "high" | "medium" | "low";
  rawAIResponse?: any;
  fallback?: boolean;
};

export function computeExportScore(metadata: ExportMetadata, emailVerified = false, sourceReliability = 50): number {
  let score = 0;
  if (emailVerified) score += 25;
  if (metadata.product && metadata.qty) score += 20;
  if (metadata.country) score += 15;
  if (metadata.hs_code) score += 10;
  if (metadata.incoterm) score += 10;
  if (metadata.buyer_type) score += 10;
  score += Math.round((Math.max(0, Math.min(100, sourceReliability)) / 100) * 10);
  return Math.min(100, score);
}

export async function classifyExportLead(params: {
  title: string; description: string; url?: string; source?: string; sourceReliability?: number; preferAI?: boolean;
}): Promise<ClassifierResult> {
  const { title, description, url = "", source = "", sourceReliability = 50, preferAI = true } = params;
  const combined = `${title}\n\n${description}\n\n${url}\n\nsource: ${source}`;
  const regexContacts = extractContacts(combined || "");
  
  let aiParsed: any = null;
  let usedAI = false;
  let reasoning = "regex-fallback";

  if (preferAI) {
    const prompt = `      Analyze this lead. Return JSON.
      Input: ${title} ${description} Source: ${source}
      Schema: { category: "export_trade"|"fabric"|"en590"|"freelance"|"other", reasoning: "", contacts: {name,email,phone}, metadata: {product,hs_code,qty,country,incoterm,buyer_type} }
      
      Rules:
      - "fabric": Textile, Sample Books, Shade Cards, Yarn, Upholstery.
      - "freelance": Web Dev, App Dev, Automation, n8n, API.
      - "en590": Diesel, Fuel, Petroleum, Commodities.
      - "export_trade": ANY International Trade, Import/Export, Buying Requirement, Tender, or Government Procurement.
      - "other": Only if it is completely irrelevant (e.g. spam, politics).`;
    try {
      usedAI = true;
      aiParsed = await analyzeLeadAI(prompt);
      reasoning = aiParsed?.reasoning || "ai-derived";
    } catch (err) {
      usedAI = false;
    }
  }

  const metadata: ExportMetadata = {
    product: aiParsed?.metadata?.product || "",
    hs_code: aiParsed?.metadata?.hs_code || "",
    qty: aiParsed?.metadata?.qty || "",
    country: aiParsed?.metadata?.country || "",
    incoterm: aiParsed?.metadata?.incoterm || "",
    buyer_type: aiParsed?.metadata?.buyer_type || "unknown",
    lead_source: source
  };

  const contacts = {
    name: regexContacts.name || aiParsed?.contacts?.name || "",
    email: regexContacts.email || aiParsed?.contacts?.email || "",
    phone: regexContacts.phone || aiParsed?.contacts?.phone || ""
  };

  const emailVerified = (contacts.email && contacts.email.includes("@"));
  const export_score = computeExportScore(metadata, Boolean(emailVerified), sourceReliability);

  let category = (aiParsed?.category || (metadata.product ? "export_trade" : "other")) as ClassifierResult["category"];
  
  // Sanity check category
  const validCats = ["export_trade", "fabric", "en590", "freelance", "other"];
  // Restriction Removed: All categories allowed`n  // if (!validCats.includes(category)) category = "other";

  return {
    success: true,
    exported_at: new Date().toISOString(),
    category,
    reasoning,
    exportMetadata: metadata,
    contacts,
    export_score,
    quality: export_score >= 85 ? "high" : export_score >= 65 ? "medium" : "low",
    fallback: !usedAI
  };
}
