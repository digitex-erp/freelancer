import { sql } from "../db";
import { batchRescoreLeads } from "../scoreEngine";

export const handler = async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = req.body || {};
    const leadIds = Array.isArray(body.leadIds) ? body.leadIds.map((v: any) => Number(v)).filter(Boolean) : null;
    
    let leadRows = [];
    if (leadIds && leadIds.length > 0) {
      leadRows = await sql`SELECT id, title, description, url, source, email, email_verified FROM leads WHERE id = ANY(${leadIds})`;
    } else {
      leadRows = await sql`SELECT id, title, description, url, source, email, email_verified FROM leads ORDER BY created_at DESC LIMIT 20`;
    }

    const plainLeads = Array.from(leadRows).map((r: any) => ({ ...r }));
    const results = await batchRescoreLeads(plainLeads, { preferAI: true }, 3);

    return res.status(200).json({ ok: true, results });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};