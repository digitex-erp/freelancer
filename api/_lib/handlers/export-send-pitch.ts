import { sql } from "../db";
import { Resend } from 'resend';

async function sendWithResend(from: string, to: string, subject: string, body: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: 'Freelancer Agent <onboarding@resend.dev>', 
    to: [to],
    subject: subject,
    html: body.replace(/\n/g, '<br>'),
    replyTo: 'ssse.vishal@gmail.com'
  });
  if (error) throw new Error(error.message);
  return { status: 200, body: data };
}

export const handler = async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  try {
    const body = req.body;
    const leadId = Number(body.leadId);
    if (!leadId) return res.status(400).json({ ok: false, error: "leadId required" });

    const rows = await sql`SELECT id, title, email, analysis FROM leads WHERE id = ${leadId}`;
    const lead = rows[0];
    if (!lead) return res.status(404).json({ ok: false, error: "lead not found" });

    const pitch = lead.analysis?.pitch;
    if (!pitch) return res.status(400).json({ ok: false, error: "no draft pitch found" });

    const to = lead.email;
    if (!to || !to.includes('@')) return res.status(400).json({ ok: false, error: "invalid email" });

    const subject = pitch.subject || "Inquiry";
    const bodyHtml = pitch.body || "";

    try {
        const providerResponse = await sendWithResend("Bell24h", to, subject, bodyHtml);
        await sql`
          INSERT INTO email_sends (lead_id, provider, status, response, subject, body)
          VALUES (${leadId}, 'resend', 'sent', ${JSON.stringify(providerResponse)}::jsonb, ${subject}, ${bodyHtml})
        `;
        await sql`UPDATE leads SET pitch_status = 'sent', status = 'pitched_sent' WHERE id = ${leadId}`;
        return res.status(200).json({ ok: true, provider: "resend" });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e.message });
    }
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
