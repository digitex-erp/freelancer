import postgres from 'postgres';

// We lazily load the connection string to ensure env vars are populated
let sqlInstance: ReturnType<typeof postgres> | undefined;

function getSql() {
  if (!sqlInstance) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error("DATABASE_URL environment variable is not set");
        throw new Error("DATABASE_URL environment variable is not set");
    }
    
    // Neon / Postgres configuration optimized for Serverless
    sqlInstance = postgres(connectionString, {
      ssl: { rejectUnauthorized: false }, // FIX: Allow self-signed certs for Render/Neon
      max: 1,         // Reduce max connections for serverless to avoid running out
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // Critical for Neon transaction pooling compatibility
    });
  }
  return sqlInstance;
}

// Export sql as a Proxy to allow lazy initialization and safe property access
export const sql = new Proxy(function() {}, {
  get: (_target, prop) => {
    // @ts-ignore
    return getSql()[prop];
  },
  apply: (_target, _thisArg, args) => {
    // @ts-ignore
    return getSql()(...args);
  }
}) as unknown as ReturnType<typeof postgres>;

// Helper to run unsafe queries (useful for dynamic SQL or when tagged template isn't enough)
export async function query(text: string, params?: any[]) {
  try {
    const s = getSql();
    const result = await s.unsafe(text, params || []);
    return { rows: result, rowCount: result.length };
  } catch (e: any) {
    // Graceful degradation: If table doesn't exist, log it and throw specific error
    // The caller can assume 'relation "leads" does not exist' implies setup needed
    if (e.code === '42P01') { // undefined_table code
      console.warn("DB Table missing:", e.message);
    }
    throw e;
  }
}

export const db = {
  async getLeads(limit = 100) {
    try {
        // Use the proxy sql for tagged template safety
        const result = await sql`
          SELECT * FROM leads 
          ORDER BY created_at DESC 
          LIMIT ${limit}
        `;
        return result;
    } catch (e: any) {
        if (e.code === '42P01') { // undefined_table code
            console.warn("Leads table missing in DB. Please run /api/setup-db");
            return [];
        }
        console.error("DB GetLeads Error:", e);
        throw e;
    }
  },
  // Legacy create method support if needed
  async createLead(lead: any) {
    // This implementation handles insertion with conflict resolution
    // Note: Usually handled by direct sql calls in handlers now
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
  }
};

export default sql;
