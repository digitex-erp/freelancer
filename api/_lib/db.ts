import postgres from 'postgres';

// We lazily load the connection string to ensure env vars are populated
let sqlInstance: ReturnType<typeof postgres> | undefined;

function getSql() {
  if (!sqlInstance) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error("❌ FATAL: DATABASE_URL environment variable is not set!");
        throw new Error("DATABASE_URL environment variable is not set");
    }
    
    // Log masked URL for debugging (Safety first!)
    const masked = connectionString.replace(/:([^:@]+)@/, ':****@');
    console.log(`🔌 Connecting to DB: ${masked}`);

    // Neon / Postgres configuration optimized for Serverless
    sqlInstance = postgres(connectionString, {
      ssl: { rejectUnauthorized: false }, // FIX: Allow self-signed certs for Render/Neon
      max: 1,         // Reduce max connections for serverless
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // Critical for Neon transaction pooling
    });
  }
  return sqlInstance;
}

// Export sql as a Proxy
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

// Explicit Connection Test Function
export async function testConnection() {
  try {
    console.log("⏳ Testing Database Connection...");
    const s = getSql();
    const result = await s`SELECT 1 as connected`;
    console.log("✅ Database Connected Successfully!", result);
    return true;
  } catch (e: any) {
    console.error("❌ Database Connection FAILED:", e.message);
    console.error("   Details:", e);
    return false;
  }
}

export const db = {
  async getLeads(limit = 100) {
    try {
        const result = await sql`
          SELECT * FROM leads 
          ORDER BY created_at DESC 
          LIMIT ${limit}
        `;
        return result;
    } catch (e: any) {
        if (e.code === '42P01') { // undefined_table code
            console.warn("⚠️ Leads table missing. Returning empty list.");
            return [];
        }
        console.error("❌ DB GetLeads Error:", e);
        throw e;
    }
  },
  async createLead(lead: any) {
    const analysisJson = lead.analysis ? JSON.stringify(lead.analysis) : '{}';
    return await sql`
        INSERT INTO leads (
          title, description, url, source, score, domain, analysis, email, status, created_at
        ) VALUES (
          ${lead.title}, ${lead.description}, ${lead.url}, ${lead.source}, 
          ${lead.score}, ${lead.domain}, ${analysisJson}::jsonb,
          ${lead.email || null}, 'new', NOW()
        )
        ON CONFLICT (url) DO NOTHING
        RETURNING *
      `;
  }
};

export default sql;
