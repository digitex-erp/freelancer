# Bell24h AI Agent - Enhanced Architecture Report

**Owner:** Vishal Pendharkar
**Architecture:** Free Tier Serverless (Vercel + Neon DB + Gemini AI)
**Last Updated:** Current

---

## 1. Executive Summary
We have successfully migrated from a complex n8n-based system to a **Serverless Architecture**. This eliminates hosting costs for automation while providing a more robust, developer-centric platform for lead generation.

The system autonomously hunts for leads in **Fabric Manufacturing (Bhiwandi)**, **Web Development**, and **EN590 Trading**, analyzes them using Google Gemini, and prepares high-conversion pitches.

---

## 2. New System Architecture (The "Free Stack")

### A. Frontend (Dashboard)
*   **Tech:** React 19 + Vite
*   **Hosting:** Vercel
*   **Role:** Command Center for viewing leads, approving pitches, and manual injection.
*   **Data Source:** Fetches real-time data from **Neon DB** via Vercel API Routes.

### B. Backend (Automation)
*   **Tech:** Vercel Serverless Functions (`/api/cron/*`)
*   **Scheduling:** Vercel Cron (Runs **Daily at 08:00 UTC**)
*   **Role:** "The Hunter". Scrapes RSS feeds, invokes Gemini AI for scoring, and saves valid leads to the database.
*   **Note:** Schedule optimized for Vercel Hobby Tier (Once Daily).

### C. Database (Persistence)
*   **Tech:** Neon (PostgreSQL)
*   **Role:** Stores Leads, Pitches, and Revenue data.
*   **Benefit:** Replaces LocalStorage. Data is now accessible from any device.

---

## 3. Implementation Steps (Action Required)

1.  **Database Setup:**
    *   Go to [Neon.tech](https://neon.tech), create a free project.
    *   Run the code from `schema.sql` in the Neon SQL Editor.
    *   Get the connection string.

2.  **Environment Variables (Vercel):**
    *   `DATABASE_URL`: Your Neon connection string (e.g., `postgres://...`).
    *   `API_KEY`: Your Google AI Studio key.
    *   `RESEND_API_KEY`: Your Resend API key for emails.

3.  **Deploy:**
    *   `git push` to Vercel.

---

## 4. Revenue Roadmap

1.  **Month 1:** Focus on **Web Dev** leads (fastest conversion) via the Dashboard feed.
2.  **Month 2:** Onboard 2-3 **Fabric Clients** using the "25-year legacy" pitch.
3.  **Month 3:** Automate EN590 scanning to catch the "Golden Deal".