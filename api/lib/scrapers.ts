import * as cheerio from "cheerio";
import { extractContactsWithAI } from "./aiContactExtractor";
import { extractContacts } from "./contactExtract";

const USER_AGENT = "Bell24h-ExportHunter/1.0 (+https://bell24h.com)";

export type ExportLead = {
  title: string;
  description: string;
  url: string;
  source: string;
  published: string;
  category: "export_trade" | "fabric" | "en590" | "freelance" | "other";
  product_guess?: string;
  qty_guess?: string;
  country_guess?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
};

async function fetchHTML(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return "";
    return await res.text();
  } catch (err) {
    return "";
  }
}

function clean(t: string) {
  return (t || "").replace(/\s+/g, " ").trim();
}

// --- Generic AI Scraper for any URL ---
export async function scrapeGenericWithAI(url: string, titleContext = "General Lead"): Promise<ExportLead | null> {
    const html = await fetchHTML(url);
    if (!html) return null;

    // 1. Regex (Fast)
    const regexContacts = extractContacts(html);
    
    // 2. AI Extraction (Accurate)
    const aiContacts = await extractContactsWithAI(html, titleContext);

    return {
        title: titleContext,
        description: clean(cheerio.load(html)('body').text().substring(0, 500)),
        url,
        source: "Web Scrape",
        published: new Date().toISOString(),
        category: "other",
        email: aiContacts.email || regexContacts.email,
        phone: aiContacts.phone || regexContacts.phone,
        company: aiContacts.company || regexContacts.company
    };
}

// --- DGFT Scraper ---
export async function scrapeDGFT(): Promise<ExportLead[]> {
  const url = "https://dgft.gov.in/CP/?opt=trade_notice";
  const html = await fetchHTML(url);
  if (!html) return [];
  const $ = cheerio.load(html);
  const out: ExportLead[] = [];
  
  const rows = $("table tbody tr").toArray();
  
  // Process a few rows concurrently to avoid timeout but be faster
  await Promise.all(rows.slice(0, 10).map(async (el) => {
    const title = clean($(el).find("td:nth-child(2)").text());
    const link = $(el).find("a").attr("href") || url;
    const fullUrl = link.startsWith("http") ? link : url;
    
    if (title.length < 5) return;

    // AI Enrichment for contact info inside the linked notice
    let contacts = { email: null, phone: null, company: null };
    // Only scrape deep if keywords match to save tokens
    if (title.toLowerCase().match(/inviting|application|notice|importer/)) {
       const deepHtml = await fetchHTML(fullUrl);
       const aiC = await extractContactsWithAI(deepHtml, title);
       contacts = { ...aiC } as any;
    }

    out.push({
      title, 
      description: "DGFT Trade Notice", 
      url: fullUrl, 
      source: "DGFT India",
      published: new Date().toISOString(), 
      category: "export_trade",
      product_guess: title,
      email: contacts.email,
      phone: contacts.phone,
      company: contacts.company
    });
  }));
  
  return out;
}

// --- APEDA Scraper ---
export async function scrapeAPEDA(): Promise<ExportLead[]> {
  const url = "https://apeda.gov.in/apedawebsite/sitrep/Buyerlist.aspx";
  const html = await fetchHTML(url);
  if (!html) return [];
  const $ = cheerio.load(html);
  const out: ExportLead[] = [];
  
  $("table tbody tr").each((_, el) => {
    const cols = $(el).find("td");
    if (!cols.length) return;
    const product = clean($(cols[1]).text());
    const country = clean($(cols[2]).text());
    const qty = clean($(cols[3]).text());
    
    // Table usually contains raw data, AI extraction might be overkill here unless details are in a modal/link
    // But we'll apply basic cleaning
    
    if (!product) return;
    out.push({
      title: `APEDA Buyer: ${product}`, 
      description: `Country: ${country}, Qty: ${qty}`,
      url, 
      source: "APEDA Export Buyers", 
      published: new Date().toISOString(),
      category: "export_trade", 
      product_guess: product, 
      qty_guess: qty, 
      country_guess: country
    });
  });
  return out;
}

export async function runExportScrapers(): Promise<ExportLead[]> {
  const scrapers = [scrapeDGFT, scrapeAPEDA];
  const results = await Promise.all(scrapers.map(async (fn) => {
    try { return await fn(); } catch { return []; }
  }));
  return results.flat();
}