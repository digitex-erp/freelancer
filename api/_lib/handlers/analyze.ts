import { analyzeLeadAI } from '../multiAI';
import { sql } from '../db';

export const handler = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { job } = req.body;
  if (!job) return res.status(400).json({ error: 'Job data required' });

  try {
    const prompt = `
        Analyze this lead and return a JSON object.
        
        Input: 
        Title: ${job.title} 
        Description: ${job.description}
        Source: ${job.source || 'Unknown'}

        Tasks:
        1. **Classify** into one of: ["FABRIC_MANUFACTURING", "FREELANCE", "EN590", "EXPORT_TRADE", "PARTNERSHIP", "FULL_TIME_ROLE", "IGNORE"].
           - Fabric Manufacturing: Upholstery, Curtains, Shade Cards, Swatches (Context: India/Bhiwandi).
           - Freelance: Web Dev, WordPress, Automation.
           - Full Time Role: Full Stack, Software Engineer, Developer (Employment).
           - EN590: Diesel, Fuel trading.
        
        2. **Extract Contacts** (CRITICAL): 
           - SCAN TEXT CAREFULLY for any Email Address.
           - Look for hidden emails (e.g. "contact at domain dot com").
           - Look for "Apply to", "Contact:", "Email:".
           - Extract Phone, Name, Company.
           - If email is found, ensure it is in the 'contacts.email' field.

        Return strict JSON:
        {
            "category": "...",
            "score": 0-100,
            "reasoning": "...",
            "keywords": ["..."],
            "contacts": {
                "email": "...",
                "phone": "...",
                "name": "...",
                "company": "..."
            }
        }
    `;

    const analysis = await analyzeLeadAI(prompt);
    
    let cat = analysis.category || 'other';
    const c = cat.toUpperCase();
    if (c.includes('FABRIC') || c.includes('TEXTILE')) cat = 'FABRIC_MANUFACTURING';
    else if (c.includes('WEB') || c.includes('FREELANCE')) cat = 'FREELANCE';
    else if (c.includes('FUEL') || c.includes('EN590')) cat = 'EN590';
    else if (c.includes('EXPORT')) cat = 'EXPORT_TRADE';
    else if (c.includes('PARTNER')) cat = 'PARTNERSHIP';
    else if (c.includes('FULL') || c.includes('EMPLOYMENT') || c.includes('ENGINEER')) cat = 'FULL_TIME_ROLE';
    else if (!["FABRIC_MANUFACTURING", "FREELANCE", "EN590", "EXPORT_TRADE", "PARTNERSHIP", "FULL_TIME_ROLE"].includes(c)) cat = 'IGNORE';
    else cat = c;

    const result = {
        ...analysis,
        category: cat,
        matchScore: analysis.score || 0,
        shortReason: analysis.reasoning || "Analyzed by Agent"
    };

    await sql`
      UPDATE leads 
      SET analysis = ${JSON.stringify(result)}::jsonb, 
          score = ${result.matchScore},
          domain = ${result.category},
          email = COALESCE(email, ${result.contacts?.email || null}),
          status = 'analyzed'
      WHERE id = ${job.id}
    `;

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
