
export enum JobCategory {
  FREELANCE = 'FREELANCE',
  PARTNERSHIP = 'PARTNERSHIP',
  EXPORT_TRADE = 'EXPORT_TRADE',
  EN590 = 'EN590',
  FABRIC_MANUFACTURING = 'FABRIC_MANUFACTURING',
  IGNORE = 'IGNORE'
}

export interface ExportMetadata {
  product?: string;
  destination_country?: string;
  quantity?: string;
  incoterm?: string; // FOB, CIF, etc.
  hs_code?: string;
  buyer_type?: 'Government' | 'Company' | 'Trader' | 'Unknown';
  target_price?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  source: string;
  date: string;
  status: 'new' | 'analyzing' | 'analyzed' | 'pitch_ready' | 'ignored';
  type: 'opportunity' | 'reply'; // Added to distinguish input type
  analysis?: AnalysisResult;
  pitch?: string;
  email?: string | null;
  
  // New Export Fields
  export_score?: number;
  country?: string;
  hs_code?: string;
  qty?: string;
  is_export?: boolean;
  email_verified?: boolean;
}

export interface AnalysisResult {
  category: JobCategory;
  matchScore: number;
  shortReason: string;
  provider?: string;
  keywords?: string[];
  contacts?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  export_metadata?: ExportMetadata; // New field for trade details
  pitch?: string | {
    subject?: string;
    body?: string;
    generatedAt?: string;
    [key: string]: any;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  website: string;
  bio: string;
  skills: string[];
  signature: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'offline';
  description: string;
  icon: string;
}

export interface AppState {
  apiKey: string;
  n8nWebhookUrl: string;
  jobs: Job[];
  view: 'dashboard' | 'feed' | 'contacts' | 'sources' | 'settings';
  agents: Agent[];
}
