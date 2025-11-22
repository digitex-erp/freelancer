
import { UserProfile, Job, Agent } from './types';

export const VISHAL_PROFILE: UserProfile = {
  name: "Vishal Pendharkar",
  email: "ssse.vishal@gmail.com",
  website: "Bell24h.com",
  signature: "Best regards,\nVishal Pendharkar\nOwner - Bhiwandi Unit (Fabric Sample Books) | Bell24h.com\nEmail: ssse.vishal@gmail.com",
  skills: [
    "Fabric Sample Book Manufacturing (25 Years Exp - Bhiwandi)",
    "Specialist in Upholstery & Curtain Fabric Shade Cards",
    "Web Development (WordPress, WooCommerce, Shopify)",
    "AI Automation (n8n, Make.com, Gemini API)",
    "Blockchain & Web3 Integration",
    "Commission Trading (EN590/Fuel)"
  ],
  bio: `I am a multi-domain professional acting as both a Manufacturer and a Tech Consultant.

  1. **FABRIC SAMPLE BOOK MANUFACTURING (Primary Business)**: 
     - I own a manufacturing unit in **Bhiwandi, Maharashtra** with **25 years of experience**.
     - We specialize in making **Sample Swatch Books, Shade Cards, and Catalogs** specifically for **Upholstery and Curtain Fabric Manufacturers**.
     - Expertise: Handling heavy Velvet, Jacquard, and Sofa fabrics. Bulk production capacity.

  2. **TECH & AUTOMATION**: 
     - Founder of Bell24h.com. 
     - Expert in Freelance Web Development (WordPress/WooCommerce), AI Automation (n8n flows), and Blockchain Smart Contracts.

  3. **TRADING**: 
     - Intermediary for EN590/Diesel trade (Commission basis).
     - General Sourcing Agent.`
};

export const AGENTS_LIST: Agent[] = [
  {
    id: 'hunter',
    name: 'The Hunter',
    role: 'Lead Discovery',
    status: 'idle',
    description: 'Scans RSS feeds (Upwork, Reddit) & Textile Boards for leads.',
    icon: 'fa-satellite-dish'
  },
  {
    id: 'listener',
    name: 'The Listener',
    role: 'Inbox Watcher',
    status: 'idle',
    description: 'Monitors replies for negotiation signals.',
    icon: 'fa-inbox'
  },
  {
    id: 'analyst',
    name: 'The Analyst',
    role: 'Scoring & Logic',
    status: 'idle',
    description: 'Prioritizes Manufacturing & Web Dev leads over others.',
    icon: 'fa-brain'
  },
  {
    id: 'closer',
    name: 'The Closer',
    role: 'Pitch & Reply',
    status: 'idle',
    description: 'Generates pitches: "25-Year Mfg Exp" for Fabric, "Tech Expert" for Web.',
    icon: 'fa-pen-nib'
  }
];

export const LEAD_SOURCES = [
  {
    name: 'Freelancer - WordPress',
    url: 'https://www.freelancer.com/rss.xml',
    type: 'rss',
    category: 'freelance',
    keywords: ['wordpress', 'woocommerce', 'php', 'react', 'automation', 'n8n']
  },
  {
    name: 'Twine - Creative Jobs',
    url: 'https://www.twine.net/jobs/rss',
    type: 'rss',
    category: 'freelance',
    keywords: ['web development', 'design', 'freelance']
  },
  {
    name: 'Remote OK - Full Stack',
    url: 'https://remoteok.com/remote-fullstack-jobs.rss',
    type: 'rss',
    category: 'freelance',
    keywords: ['full stack', 'react', 'node', 'api', 'automation']
  },
  {
    name: 'Jooble India - Tech',
    url: 'https://in.jooble.org/rss/search-vacancy?q=wordpress+developer',
    type: 'rss',
    category: 'freelance',
    keywords: ['wordpress', 'developer', 'php']
  },
  {
    name: 'Global Buyers Online',
    url: 'https://www.globalbuyersonline.com/rss/latest-buy-leads.xml',
    type: 'rss',
    category: 'export_trade',
    keywords: ['textile', 'garments', 'importer']
  },
  {
    name: 'OfBusiness Tenders',
    url: 'https://www.ofbusiness.com/xml/tenders.xml',
    type: 'scraper',
    category: 'fabric_manufacturing',
    keywords: ['fabric', 'textile', 'procurement']
  },
  {
    name: 'r/forhire - Web Dev',
    url: 'https://www.reddit.com/r/forhire/search.json?q=wordpress+OR+react+OR+web+development&restrict_sr=1&limit=25&sort=new',
    type: 'reddit',
    category: 'freelance',
    keywords: ['wordpress', 'react', 'web', 'freelance']
  },
  {
    name: 'r/textile - Fabric Buyers',
    url: 'https://www.reddit.com/r/textile/search.json?q=fabric+OR+sample+OR+upholstery&restrict_sr=1&limit=25&sort=new',
    type: 'reddit',
    category: 'fabric',
    keywords: ['fabric', 'textile', 'sample', 'upholstery']
  },
  {
    name: 'r/CommodityTrading - EN590',
    url: 'https://www.reddit.com/r/CommodityTrading/search.json?q=diesel+OR+EN590+OR+fuel&restrict_sr=1&limit=25&sort=new',
    type: 'reddit',
    category: 'en590',
    keywords: ['en590', 'diesel', 'fuel', 'trading']
  },
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'fab-1',
    title: "Requirement for 5000 Velvet Shade Cards",
    source: "Textile Infomedia",
    date: new Date().toISOString(),
    status: 'new',
    type: 'opportunity',
    description: "D'Decor style velvet upholstery fabric manufacturer in Surat looking for a vendor to make high-quality waterfall sample books. Quantity: 5000 sets."
  },
  {
    id: '1',
    title: "WooCommerce Payment Gateway Developer",
    source: "Upwork RSS",
    date: new Date().toISOString(),
    status: 'new',
    type: 'opportunity',
    description: "Need a developer to implement a custom payment gateway for a Canadian Shopify store. Must know Node.js and React."
  },
  {
    id: '6',
    title: "EN590 FOB Rotterdam - Buyer Mandate",
    source: "GlobalTrade.net",
    date: new Date().toISOString(),
    status: 'new',
    type: 'opportunity',
    description: "We have a buyer for 50k MT EN590 FOB Rotterdam. Dip and Pay. Need direct seller mandate."
  },
  {
    id: '7',
    title: "RE: Inquiry about Rice Export",
    source: "Inbox",
    date: new Date().toISOString(),
    status: 'new',
    type: 'reply',
    description: "Hi Vishal, we received your pitch. What is your commission structure and do you have a MOQ? We need 5 containers to start."
  }
];
