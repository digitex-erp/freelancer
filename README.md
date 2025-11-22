
# Bell24h AI Agent (v2.0)

**Freelance & Trade Automation Platform**

This is a serverless AI Agent designed to autonomously hunt for freelance leads, analyze textile manufacturing opportunities, and facilitate EN590 trading deals. It leverages **Google Gemini 2.0 Flash**, **OpenAI GPT-4**, and robust scraping to automate the procurement and pitching process.

## 🚀 New in v2.0 (Mega Hunter)

*   **50+ Lead Sources**: Replaced dead RSS feeds with a robust mix of RSS, JSON APIs, Reddit, and HTML scraping.
    *   Sources include: Freelancer.com, WeWorkRemotely, Reddit (forhire, textile), IndiaMART, TradeKey.
*   **Contact Extraction**: AI now automatically extracts **Emails, Phone Numbers, and Company Names** from job descriptions.
*   **Multi-AI Fallback**: Falls back to OpenAI/DeepSeek if Gemini is busy.
*   **Cheerio Scraping**: Integrated HTML scraping for B2B marketplaces.

## 🛠️ Tech Stack

*   **Frontend**: React 19, Vite, TailwindCSS
*   **Backend**: Vercel Serverless Functions (Node.js)
*   **Database**: Neon (Serverless PostgreSQL)
*   **AI**: Google Gemini 2.0 Flash Exp, OpenAI GPT-4o-mini
*   **Scraping**: `cheerio`, `rss-parser`

## 📦 Setup & Deployment

### 1. Deploy to Vercel
Push your code to GitHub/GitLab/Bitbucket and import it into Vercel.

### 2. Configure Environment Variables
Go to Vercel -> Settings -> Environment Variables and add:

| Key | Description |
| :--- | :--- |
| `DATABASE_URL` | **Required.** Postgres URL from Neon (Must start with `postgresql://`). |
| `API_KEY` | **Required.** Google Gemini API Key. |
| `OPENAI_API_KEY` | Optional. Backup AI provider. |

### 3. One-Click Database Setup
After deployment, visit: `https://your-app-name.vercel.app/api/setup-db`

## 📂 Key Files

*   `api/cron/fetch-leads.ts`: The "Hunter" agent. Runs periodically to fetch and save leads.
*   `api/_lib/multiAI.ts`: The "Brain". Handles AI analysis and contact extraction.
*   `components/JobCard.tsx`: The UI. Displays leads and extracted contacts.

---

**Owner**: Vishal Pendharkar | Bell24h.com
