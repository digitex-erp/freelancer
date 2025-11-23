import { db } from '../db';

export const handler = async (req: any, res: any) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  const limit = Number(req.query.limit) || 100;
  
  try {
    const leads = await db.getLeads(limit);
    return res.status(200).json(leads);
  } catch (error: any) {
     if (error.code === '42P01' || error.message.includes('leads')) {
         return res.status(200).json([]); // Return empty if table missing
     }
     throw error;
  }
};