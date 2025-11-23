export const handler = async (req: any, res: any) => {
  const checks: any = {
    timestamp: new Date().toISOString(),
    database: 'not_checked',
    google_ai: 'not_checked',
    env: {
      hasDatabaseUrl: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      hasApiKey: !!process.env.API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  };

  // Test database
  if (checks.env.hasDatabaseUrl) {
    try {
      const { query } = await import('../db');
      const result = await query('SELECT 1 as test');
      checks.database = result.rows?.[0]?.test === 1 ? 'ok' : 'failed';
    } catch (error: any) {
      checks.database = `error: ${error.message}`;
    }
  } else {
    checks.database = 'no_url';
  }

  // Test Google AI Key presence
  if (checks.env.hasApiKey) {
    checks.google_ai = 'key_present';
  } else {
    checks.google_ai = 'key_missing';
  }

  const allOk = checks.database === 'ok' && checks.google_ai === 'key_present';

  return res.status(allOk ? 200 : 503).json({
    ok: allOk,
    checks
  });
};