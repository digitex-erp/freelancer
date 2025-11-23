import { Resend } from 'resend';

export const handler = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body;
  const to = body.to || body.recipientEmail;
  const { subject, body: emailBody } = body;

  if (!to || !emailBody) return res.status(400).json({ error: 'Missing recipient (to) or body' });

  if (!to.includes('@')) return res.status(400).json({ error: 'Invalid email address' });

  const resendKey = process.env.RESEND_API_KEY;
  
  try {
    if (resendKey && !resendKey.startsWith('re_mock') && !resendKey.includes('placeholder')) {
        const resend = new Resend(resendKey);
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Bell24h Agent <onboarding@resend.dev>',
            to: [to],
            replyTo: 'ssse.vishal@gmail.com',
            subject: subject || 'Inquiry from Bell24h',
            html: (emailBody || '').replace(/\n/g, '<br>')
        });

        if (error) throw new Error(error.message);
        return res.status(200).json({ success: true, data, provider: 'resend' });
    }

    if (process.env.GMAIL_SMTP_USER) {
        const nodemailerModule = await import('nodemailer'); 
        const nodemailer = nodemailerModule.default || nodemailerModule;

        const transporter = nodemailer.createTransport({
            host: process.env.GMAIL_SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.GMAIL_SMTP_PORT || 587),
            secure: Number(process.env.GMAIL_SMTP_PORT || 587) === 465,
            auth: { 
                user: process.env.GMAIL_SMTP_USER, 
                pass: process.env.GMAIL_SMTP_PASS 
            }
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.GMAIL_SMTP_USER,
            to,
            subject: subject || 'Inquiry',
            html: emailBody.replace(/\n/g, '<br>')
        });
        return res.status(200).json({ success: true, data: info, provider: 'gmail_smtp' });
    }

    return res.status(200).json({ success: true, mock: true, message: "Mock send (No provider configured)" });

  } catch (error: any) {
    console.error("Send Error:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};