import postgres from 'postgres';
import Parser from 'rss-parser';
import { runExportScrapers } from '../_lib/scrapers.js';
import { classifyExportLead } from '../_lib/exportClassifier.js';
import { generatePitchAI } from '../_lib/multiAI.js';

const parser = new Parser({ timeout: 8000, headers: { 'User-Agent': 'Bell24h-Bot/4.0' } });

// Combined Source List
const SOURCES = [
  { url: "https://www.upwork.com/ab/feed/jobs/rss?q=automation%20OR%20n8n%20OR%20wordpress%20OR%20woocommerce", type: "rss", name: "Upwork RSS" },
  { url: "https://www.reddit.com/r/textile/new/.rss", type: "rss", name: "Reddit Textile" },
  { url: "https://www.reddit.com/r/forhire/new/.rss", type: "rss", name: "Reddit ForHire" },
  { url: "https://www.freelancer.com/rss.xml", type: "rss", name: "Freelancer" },
  { url: "https://remoteok.com/api", type: "json", name: "RemoteOK" },
  // PHASE 2: GLOBAL TRADE SOURCES
  { url: "https://news.google.com/rss/search?q=import+export+business+opportunities+when:1d&hl=en-IN&gl=IN&ceid=IN:en", type: "rss", name: "Google Trade News" },
  { url: "https://news.google.com/rss/search?q=buying+requirement+india+export+when:1d&hl=en-IN&gl=IN&ceid=IN:en", type: "rss", name: "Global Buying Reqs" },
  { url: "https://news.google.com/rss/search?q=tender+notice+export+import+when:1d&hl=en-IN&gl=IN&ceid=IN:en", type: "rss", name: "Global Tenders" }
];

// Use generic any for request/response to support both Vercel and Express
export default async function handler(req: any, res: any) {
  console.log("🚀 Bell24h Google AI Agent: Starting Automated Hunt...");

  // 1. FETCH RAW LEADS
  const leads: any[] = [];

  // RSS & JSON Fetching
  await Promise.all(SOURCES.map(async (src) => {
    try {
      if (src.type === 'rss') {
        const feed = await parser.parseURL(src.url);
        feed.items.forEach(item => leads.push({
          title: item.title,
          description: item.contentSnippet || item.content || '',
          url: item.link,
          source: src.name
        }));
      } else if (src.type === 'json') {
        const r = await fetch(src.url);
        const d = await r.json();
        if (Array.isArray(d)) {
          d.slice(1, 10).forEach((j: any) => leads.push({
            title: j.position || j.title,
            description: j.description,
            url: j.url,
            source: src.name
          }));
        }
      }
    } catch (e) { console.error(`Source Error ${src.name}:`, e); }
  }));

  // Scrapers
  try {
    const scraped = await runExportScrapers();
    leads.push(...scraped);
  } catch (e) { console.error("Scraper Error:", e); }

  console.log(`📥 Hunter: Fetched ${leads.length} raw leads from the wild.`);

  // 2. PROCESS & ANALYZE
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ Database not connected. Skipping save.");
    return res.status(500).json({ error: "Database not configured" });
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  let savedCount = 0;
  let pitchedCount = 0;

  try {
    // Limit processing to avoid timeout
    const toProcess = leads.slice(0, 25);

    for (const lead of toProcess) {
      if (!lead.url) continue;

      // Dedup check
      const existing = await sql`SELECT id FROM leads WHERE url = ${lead.url} LIMIT 1`;
      if (existing.length > 0) continue;

      // AI ANALYSIS
      const result = await classifyExportLead({
        title: lead.title,
        description: lead.description,
        url: lead.url,
        source: lead.source,
        preferAI: true
      });

      const score = result.export_score || 0;
      const cat = result.category;

      let pitchJSON = null;
      let status = 'new';
      let pitchStatus = null;

      // AUTO-PITCH GENERATION (High Value Leads)
      if (score >= 70 || cat === 'en590' || cat === 'fabric' || cat === 'freelance') {
        try {
          const context = `Title: ${lead.title}\nDescription: ${lead.description}\nCategory: ${cat}\nMetadata: ${JSON.stringify(result.exportMetadata)}`;

          // Map category to persona
          let template = 'distributor';
          if (cat === 'en590') template = 'en590_broker';
          if (cat === 'fabric') template = 'manufacturer';
          if (cat === 'freelance') template = 'freelance_dev';

          const draft = await generatePitchAI(context, template);

          pitchJSON = {
            subject: draft.subject,
            body: draft.body,
            generatedAt: new Date().toISOString()
          };
          status = 'pitch_ready';
          pitchStatus = 'draft';
          pitchedCount++;
        } catch (e) { console.error("Auto-Pitch Error:", e); }
      }

      // Map category for DB/Frontend compatibility
      let dbDomain = 'IGNORE';
      if (cat === 'fabric') dbDomain = 'FABRIC_MANUFACTURING';
      else if (cat === 'freelance') dbDomain = 'FREELANCE';
      else if (cat === 'en590') dbDomain = 'EN590';
      else if (cat === 'export_trade') dbDomain = 'EXPORT_TRADE';

      // SAVE TO DB
      await sql`
        INSERT INTO leads (
          title, description, url, source, score, domain, analysis, email, status,
          export_metadata, export_score, country, hs_code, qty, is_export, 
          pitch_status, created_at
        ) VALUES (
          ${lead.title}, ${lead.description}, ${lead.url}, ${lead.source},
          ${score}, ${dbDomain},
          ${JSON.stringify({
        ...result,
        matchScore: score,
        category: dbDomain,
        contacts: result.contacts,
        pitch: pitchJSON
      })}::jsonb,
          ${result.contacts.email || null}, 
          ${status},
          ${JSON.stringify(result.exportMetadata)}::jsonb, 
          ${score}, 
          ${result.exportMetadata?.country || null}, 
          ${result.exportMetadata?.hs_code || null}, 
          ${result.exportMetadata?.qty || null}, 
          ${cat !== 'freelance' && cat !== 'other'},
          ${pitchStatus},
          NOW()
        )
      `;
      savedCount++;
    }

    console.log(`✅ Agent Run Complete: Saved ${savedCount} new leads, drafted ${pitchedCount} pitches.`);

    return res.status(200).json({
      success: true,
      fetched: leads.length,
      saved: savedCount,
      auto_pitched: pitchedCount,
      message: "Hunter Agent run complete."
    });

  } catch (e: any) {
    console.error("Agent Fatal Error:", e);
    return res.status(500).json({ error: e.message });
  } finally {
    await sql.end();
  }
}
