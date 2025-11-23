import postgres from 'postgres';

// Connection is only created in Vercel Functions, not in browser
const connectionString = process.env.DATABASE_URL || '';

export const sql = postgres(connectionString, {
  max: 1, // Serverless environment requires limiting connections
  ssl: 'require', // Required for Neon/Production
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = {
  async getLeads(limit = 100) {
    try {
      return await sql`
        SELECT * FROM leads 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `;
    } catch (e) {
      console.error("DB Error:", e);
      return [];
    }
  },
  
  async createLead(lead: any) {
    try {
      // Safely handle analysis object for JSONB storage
      const analysisJson = lead.analysis ? JSON.stringify(lead.analysis) : '{}';
      
      return await sql`
        INSERT INTO leads (
          title, description, url, source, score, domain, analysis, email, status, created_at
        ) VALUES (
          ${lead.title}, 
          ${lead.description}, 
          ${lead.url}, 
          ${lead.source}, 
          ${lead.score}, 
          ${lead.domain}, 
          ${analysisJson}::jsonb,
          ${lead.email || null}, 
          'new', 
          NOW()
        )
        ON CONFLICT (url) DO NOTHING
        RETURNING *
      `;
    } catch (e) {
      console.error("DB Create Error:", e);
      return null;
    }
  }
};