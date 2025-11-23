import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import handlers from _lib to prevent them being deployed as separate functions
import { handler as leadsHandler } from './_lib/handlers/leads';
import { handler as analyzeHandler } from './_lib/handlers/analyze';
import { handler as pitchHandler } from './_lib/handlers/pitch';
import { handler as sendPitchHandler } from './_lib/handlers/send-pitch';
import { handler as setupDbHandler } from './_lib/handlers/setup-db';
import { handler as healthHandler } from './_lib/handlers/health';
import { handler as exportDraftsHandler } from './_lib/handlers/export-drafts';
import { handler as exportClassifyHandler } from './_lib/handlers/export-classify';
import { handler as exportRescoreHandler } from './_lib/handlers/export-rescore';
import { handler as exportPitchHandler } from './_lib/handlers/export-pitch';
import { handler as exportSendPitchHandler } from './_lib/handlers/export-send-pitch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel passes the full URL, we need to parse the path
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`[Router] Handling: ${pathname}`);

  try {
    // Core Routes
    if (pathname.includes('/api/leads')) return await leadsHandler(req, res);
    if (pathname.includes('/api/analyze')) return await analyzeHandler(req, res);
    if (pathname.includes('/api/pitch')) return await pitchHandler(req, res);
    if (pathname.includes('/api/send-pitch')) return await sendPitchHandler(req, res);
    if (pathname.includes('/api/setup-db')) return await setupDbHandler(req, res);
    if (pathname.includes('/api/health')) return await healthHandler(req, res);

    // Export/Trade Routes
    if (pathname.includes('/api/export/drafts')) return await exportDraftsHandler(req, res);
    if (pathname.includes('/api/export/classify')) return await exportClassifyHandler(req, res);
    if (pathname.includes('/api/export/rescore')) return await exportRescoreHandler(req, res);
    if (pathname.includes('/api/export/send-pitch')) return await exportSendPitchHandler(req, res);
    
    // Overloaded paths (legacy support)
    if (pathname.endsWith('/export-pitch')) return await exportPitchHandler(req, res);

    return res.status(404).json({ error: 'API Route not found', path: pathname });
  } catch (error: any) {
    console.error(`[Router Error] ${pathname}:`, error);
    return res.status(500).json({ error: error.message });
  }
}