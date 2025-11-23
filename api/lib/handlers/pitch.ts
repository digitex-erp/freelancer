import { generatePitchAI } from '../multiAI';
import { sql } from '../db';

export const handler = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { job, analysis } = req.body;
  if (!job) return res.status(400).json({ error: 'Job required' });

  try {
    const cat = (analysis?.category || job.domain || '').toString().toUpperCase();
    let template = 'freelance_dev';
    
    if (cat.includes('FABRIC')) template = 'manufacturer';
    if (cat.includes('EN590')) template = 'en590_broker';
    if (cat.includes('EXPORT')) template = 'distributor';

    const context = `Title: ${job.title}\nDescription: ${job.description}\nCategory: ${cat}`;
    const draft = await generatePitchAI(context, template);

    if (job.id && !job.id.toString().startsWith('sim-')) {
       const pitchObj = { subject: draft.subject, body: draft.body, generatedAt: new Date().toISOString() };
       await sql`
        UPDATE leads 
        SET analysis = jsonb_set(COALESCE(analysis, '{}'::jsonb), '{pitch}', ${JSON.stringify(pitchObj)}::jsonb, true),
            pitch_status = 'draft'
        WHERE id = ${job.id}
       `;
    }

    return res.status(200).json({ pitch: draft.body });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};