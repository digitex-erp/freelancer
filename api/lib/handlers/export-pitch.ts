import { sql } from "../db";
import { analyzeLeadAI } from "../multiAI";

function defaultSubject(templateType: string, metadata: any) {
  const product = metadata.product || "product";
  const country = metadata.country || "";
  if (templateType === "government") return `Supply Offer: ${product} — Tender response for ${country}`;
  if (templateType === "distributor") return `Supply Proposal: ${product} for ${country} distributors`;
  if (templateType === "commodity") return `Commercial Offer: ${product} — Bulk Supply`;
  return `Supply Enquiry: ${product}`;
}

export const handler = async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  try {
    const body = req.body;
    const leadId = Number(body.leadId);
    if (!leadId) return res.status(400).json({ ok: false, error: "leadId required" });

    const rows = await sql`SELECT id, title, description, url, source, email, analysis, export_metadata FROM leads WHERE id = ${leadId}`;
    const leadRow = rows[0];
    if (!leadRow) return res.status(404).json({ ok: false, error: "lead not found" });

    const metadata = (leadRow.export_metadata) ? leadRow.export_metadata : (leadRow.analysis?.exportMetadata || {});
    const templateType = body.templateType || "distributor";
    
    const leadTxt = `${leadRow.title}\n\n${leadRow.description}\n\nURL: ${leadRow.url || ""}\nSource: ${leadRow.source || ""}`;
    const prompt = `
      You are an export sales specialist. Create a polite, concise, professional email pitch in ENGLISH only.
      Return ONLY a JSON object with "subject" and "body" keys.
      Input: ${leadTxt}
      Metadata: ${JSON.stringify(metadata)}
    `;

    let pitchObj: any = {};
    try {
      const aiResp = await analyzeLeadAI(prompt);
      pitchObj = aiResp;
      if (!pitchObj.body) throw new Error("No body");
    } catch (err: any) {
      pitchObj = {
        subject: defaultSubject(templateType, metadata),
        body: `Hello,\n\nI am writing regarding your requirement for ${metadata.product || 'products'}. Please let us know your target price and specs.\n\nRegards,\nVishal\nBell24h.com`
      };
    }

    const pitchJSON = { 
      subject: pitchObj.subject, 
      body: pitchObj.body, 
      templateType, 
      generatedAt: new Date().toISOString() 
    };

    await sql`
      UPDATE leads SET
        analysis = jsonb_set(COALESCE(analysis, '{}'::jsonb), '{pitch}', ${JSON.stringify(pitchJSON)}::jsonb, true),
        pitch_status = 'draft',
        last_validated_at = now()
      WHERE id = ${leadId}
    `;

    return res.status(200).json({ ok: true, pitch: pitchJSON, saved: true });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};