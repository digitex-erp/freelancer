import { sql } from '../db';

export default async function handler(req: any, res: any) {
    try {
        const dbVersion = await sql`SELECT version()`;
        return res.status(200).json({ 
            status: 'ok', 
            db: 'connected', 
            version: dbVersion[0].version,
            env: process.env.VERCEL_ENV || 'dev',
            functionCount: 'Optimized (Central Handler)'
        });
    } catch (e: any) {
        return res.status(500).json({ status: 'error', error: e.message });
    }
}