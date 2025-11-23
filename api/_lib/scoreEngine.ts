import { sql } from "./db";
import { classifyExportLead, ClassifierResult } from "./exportClassifier";

export type RescoreOptions = {
  sourceReliability?: number;
  preferAI?: boolean;
};

export async function rescoreSingleLead(leadRow: any, options: RescoreOptions = {}) {
  const { id, title, description, url, source, email, email_verified } = leadRow;
  try {
    const classifyResult: ClassifierResult = await classifyExportLead({
      title: title || "",
      description: description || "",
      url: url || "",
      source: source || "",
      sourceReliability: options.sourceReliability ?? 50,
      preferAI: options.preferAI !== false
    });

    const contacts = classifyResult.contacts || {};
    const finalEmail = contacts.email && contacts.email.length > 3 ? contacts.email : (email || null);
    const exportMetadata = classifyResult.exportMetadata || {};
    const is_export = (classifyResult.category === "export_trade") || (!!exportMetadata.product);

    await sql`
      UPDATE leads SET
        analysis = ${JSON.stringify(classifyResult)}::jsonb,
        export_metadata = ${JSON.stringify(exportMetadata)}::jsonb,
        export_score = ${classifyResult.export_score || 0},
        is_export = ${is_export},
        country = ${exportMetadata.country || null},
        hs_code = ${exportMetadata.hs_code || null},
        qty = ${exportMetadata.qty || null},
        email = COALESCE(${finalEmail}, leads.email),
        last_validated_at = now()
      WHERE id = ${id}
    `;

    return { id, updated: true, export_score: classifyResult.export_score };
  } catch (err: any) {
    return { id, updated: false, error: err.message };
  }
}

export async function batchRescoreLeads(leadRows: any[], options: RescoreOptions = {}, concurrency = 3) {
  const results: any[] = [];
  for (let i = 0; i < leadRows.length; i += concurrency) {
    const chunk = leadRows.slice(i, i + concurrency);
    const promises = chunk.map((lr) => rescoreSingleLead(lr, options));
    const settled = await Promise.allSettled(promises);
    for (const s of settled) {
      if (s.status === "fulfilled") results.push(s.value);
      else results.push({ error: (s.reason as any)?.message });
    }
    await new Promise((r) => setTimeout(r, 350));
  }
  return results;
}