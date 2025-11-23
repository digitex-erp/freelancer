import { query } from '../db';

export const handler = async (req: any, res: any) => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT UNIQUE,
        source TEXT,
        email TEXT,
        phone TEXT,
        company TEXT,
        status TEXT DEFAULT 'new',
        score INTEGER DEFAULT 0,
        domain TEXT,
        analysis JSONB,
        pitch_status TEXT,
        is_export BOOLEAN DEFAULT false,
        export_score INTEGER DEFAULT 0,
        export_metadata JSONB,
        country TEXT,
        hs_code TEXT,
        qty TEXT,
        last_validated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS email_sends (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER,
        provider TEXT,
        status TEXT,
        response JSONB,
        subject TEXT,
        body TEXT,
        sent_at TIMESTAMP DEFAULT NOW()
      );
    `);

    return res.status(200).json({
      ok: true,
      message: 'Database initialized successfully'
    });

  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};