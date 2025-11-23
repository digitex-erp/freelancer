import { sql } from "../db";

export const handler = async (req: any, res: any) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (!process.env.DATABASE_URL) return res.json({ ok: true, results: [] });

    const drafts = await sql`
      SELECT 
        id, title, email, source, country, export_metadata, analysis, pitch_status, created_at
      FROM leads 
      WHERE pitch_status = 'draft' 
         OR (analysis->>'pitch' IS NOT NULL AND pitch_status IS NULL)
      ORDER BY last_validated_at DESC NULLS LAST, created_at DESC
      LIMIT 50
    `;

    const results = drafts.map((d: any) => ({
      id: d.id,
      title: d.title,
      country: d.country || d.export_metadata?.country || 'Unknown',
      product: d.export_metadata?.product,
      email: d.email || d.analysis?.contacts?.email,
      pitch_body: d.analysis?.pitch?.body,
      pitch_subject: d.analysis?.pitch?.subject,
      created_at: d.created_at
    }));

    return res.status(200).json({ ok: true, results });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};