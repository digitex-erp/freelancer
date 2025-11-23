import { db } from '../db.js';

export const handler = async (req: any, res: any) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const limit = Number(req.query.limit) || 100;

  try {
    const leads = await db.getLeads(limit);
    return res.status(200).json(leads);
  } catch (error: any) {
    console.error("Detailed DB Error:", error);
    
    // Return specific error details to the client for debugging
    return res.status(500).json({ 
      error: "DB_CONNECTION_FAILED", 
      message: error.message, 
      code: error.code || 'UNKNOWN',
      details: "Check Render Environment Variables (DATABASE_URL). Ensure it includes ?sslmode=require"
    });
  }
};
