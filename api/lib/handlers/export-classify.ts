import { classifyExportLead } from "../exportClassifier";

export const handler = async (req: any, res: any) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const leads = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];
    for (const l of leads) {
      const out = await classifyExportLead({
        title: l.title || "", description: l.description || "", url: l.url || "", source: l.source || "", preferAI: true
      });
      results.push({ input: l, output: out });
    }
    return res.status(200).json({ ok: true, results });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};