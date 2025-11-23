import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Job, AnalysisResult, JobCategory, UserProfile } from "../types";

// Define the schema for the analysis step
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: [
        JobCategory.FABRIC_MANUFACTURING,
        JobCategory.FREELANCE,
        JobCategory.PARTNERSHIP,
        JobCategory.EXPORT_TRADE,
        JobCategory.EN590,
        JobCategory.IGNORE
      ],
      description: "The category of the job opportunity."
    },
    matchScore: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating how well this matches Vishal's profile."
    },
    shortReason: {
      type: Type.STRING,
      description: "A one sentence reason for the classification and score."
    },
    contacts: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            company: { type: Type.STRING }
        },
        description: "Extracted contact details from the text."
    }
  },
  required: ["category", "matchScore", "shortReason"]
};

// Schema for generating synthetic jobs
const jobListSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      source: { type: Type.STRING },
      date: { type: Type.STRING }
    },
    required: ["title", "description", "source", "date"]
  }
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Simulates a search by asking AI to generate realistic job descriptions based on a query.
   */
  async simulateJobSearch(query: string): Promise<Job[]> {
    try {
      const model = "gemini-2.5-flash";
      const isInboxSimulation = query.toLowerCase().includes("inbox") || query.toLowerCase().includes("reply");
      const isFabricQuery = query.toLowerCase().match(/fabric|textile|sample|book|binder|curtain|upholstery|sofa|jacquard|velvet|shade card/);
      const isEN590Query = query.toLowerCase().match(/en590|diesel|fuel|trade|export/);
      
      let prompt = "";

      if (isInboxSimulation) {
        prompt = `
          Generate 4 realistic INCOMING EMAIL REPLIES addressed to 'Vishal' or 'Bell24h'.
          These should represent responses from clients or partners.
          
          Use these specific Scenarios:
          1. "Re: Sample Book Quotation": A textile mill owner (D'Decor competitor) asking for the per-piece price for 2000 shade cards (Velvet Upholstery collection).
          2. "Re: Payment Gateway Proposal": A Shopify store owner asking for your hourly rate.
          3. "Re: SOP Requirement": An EN590 Buyer mandate sending a counter-offer (FOB Rotterdam).
          4. "Partnership Opportunity": A manager from a Payment Processor wanting to discuss partnership.
          
          Format them as realistic email snippets.
        `;
      } else {
        prompt = `
          The user uses a "Free Procurement" strategy via RSS Feeds and Public Boards.
          Generate 5 realistic, detailed job/lead postings related to the search term: "${query}".
          
          STRICTLY mimic the format of these FREE data sources:
          
          1. **"Upwork RSS" / "Reddit ForHire"**: 
             - Format: Title includes "[Budget: $xxx]" or "Hourly".
             - Description: Tech requirements (WordPress, n8n, Automation) OR Design requirements.
          
          2. **"Textile Infomedia" / "B2B India" / "Fiber2Fashion" (Priority if query relates to Fabric)**:
             - **CRITICAL**: These leads MUST be for "Fabric Sample Book Manufacturing", "Shade Card Making", or "Catalog Binding".
             - Context: Textile Mills in Mumbai, Surat, or Bhiwandi looking for a vendor.
             - Specific Keywords: "Upholstery Fabric", "Curtain Fabric", "Sofa Material", "Heavy Jacquard", "Velvet Swatches", "Waterfall Binding".
             - Example: "Urgent: Required Factory for 3000 Sets of Sofa Fabric Sample Books - Bhiwandi/Mumbai".
          
          3. **"GlobalTrade.net" / "TradeBoard"**:
             - Format: "Buying [Product] - [Destination]".
             - If EN590: "Buyer mandate seeking EN590 50k MT FOB Rotterdam".

          4. **"PartnerStack"**:
             - SaaS partnership opportunities.

          ${isFabricQuery ? 'ENSURE at least 3 results are specifically related to FABRIC SAMPLE BOOK MANUFACTURING for Upholstery/Curtains in India.' : ''}
          ${isEN590Query ? 'ENSURE at least 1 result is an EN590 Diesel Trade Lead.' : ''}

          Make them sound authentic to their source.
        `;
      }

      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: jobListSchema
        }
      });

      const jsonText = response.text;
      if (!jsonText) return [];

      const rawJobs = JSON.parse(jsonText) as any[];
      
      // Map to our Job interface
      return rawJobs.map((j, index) => ({
        id: `sim-${Date.now()}-${index}`,
        title: j.title,
        description: j.description,
        source: isInboxSimulation ? "Inbox (Simulated)" : (j.source || "RSS Feed"),
        date: j.date || new Date().toISOString(),
        status: 'new',
        type: isInboxSimulation ? 'reply' : 'opportunity'
      }));

    } catch (error) {
      console.error("Simulation Error:", error);
      return [];
    }
  }

  async analyzeJob(job: Job, profile: UserProfile): Promise<AnalysisResult> {
    try {
      const model = "gemini-2.5-flash";
      
      const prompt = `
        You are an AI assistant for Vishal Pendharkar. 
        Analyze the ${job.type === 'reply' ? 'INCOMING EMAIL REPLY' : 'JOB OPPORTUNITY'} using a strict WATERFALL PRIORITY logic.
        
        Vishal's Profile:
        ${profile.bio}
        
        Title: ${job.title}
        Content/Description: ${job.description}
        Source: ${job.source}
        
        STRICT CLASSIFICATION LOGIC (Execute in Order):
        
        1. **FABRIC_MANUFACTURING** (Legacy/Core - High Priority):
           - Look for keywords: "Sample Books", "Shade Cards", "Swatches", "Fabric Catalog", "Binder", "Textile Mill", "Upholstery", "Curtains", "Velvet", "Jacquard", "Sofa Fabric".
           - Region context: India, Mumbai, Bhiwandi, Surat favors this.
           - This is a MANUFACTURING job, not trading.
        
        2. **FREELANCE** (High Priority - Cash Flow):
           - Look for: Web Development, WordPress, WooCommerce, Shopify, React, Node.js, AI Automation (n8n/Make).
           - Blockchain, Web3, Smart Contracts.
           
        3. **EXPORT_TRADE**:
           - Look for: General Import/Export, Sourcing Agent, Buying/Selling General Goods.
           
        4. **PARTNERSHIP**:
           - Look for: "Agency Partner", "Referral Program".
           
        5. **EN590** (Lower Priority - Specific Niche):
           - Look for EXPLICIT mentions of: "EN590", "Diesel", "Jet Fuel", "FOB Rotterdam", "ULSD".
           
        6. **IGNORE**:
           - Everything else.
        
        CRITICAL INSTRUCTION: EXTRACT CONTACT INFO
        - You MUST extract any email address found in the text.
        - Look for "Apply at: email@address.com".
        - Look for "Contact: name (email@address.com)".
        - Look for obfuscated emails like "name AT domain DOT com".
        - If multiple emails exist, prefer the one explicitly labeled for applications or inquiries.
        - Extract Phone Number, Contact Name, or Company Name if present.
        - Populate the 'contacts' field in the response.

        Calculate 'matchScore' (0-100). 
        - If Fabric Manufacturing for Upholstery/Curtains: 98+.
        - If Web Dev/Automation: 85+.
      `;

      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema
        }
      });

      const jsonText = response.text;
      if (!jsonText) return { category: JobCategory.IGNORE, matchScore: 0, shortReason: "No response from AI" };
      
      return JSON.parse(jsonText) as AnalysisResult;

    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return {
        category: JobCategory.IGNORE,
        matchScore: 0,
        shortReason: "Error analyzing job via AI."
      };
    }
  }

  async generatePitch(job: Job, analysis: AnalysisResult, profile: UserProfile): Promise<string> {
    try {
      const model = "gemini-2.5-flash";
      const isReply = job.type === 'reply';

      const prompt = `
        Write a high-conversion, professional ${isReply ? 'EMAIL REPLY' : 'COLD PITCH'} for Vishal Pendharkar.
        
        Context:
        - Category: ${analysis.category}
        - ${isReply ? 'Incoming Message' : 'Job Title'}: ${job.title}
        - Content: ${job.description}
        
        Specific Instructions by Category:

        1. **FABRIC_MANUFACTURING** (Targeting Textile Mills):
           - **Hook**: "I own a manufacturing unit in Bhiwandi with 25 years of legacy in making high-quality Sample Books & Shade Cards."
           - **Authority**: Mention capacity for heavy Velvet/Jacquard fabrics, Waterfall Binding, and Hardbound Catalogs for Upholstery & Curtains.
           - **CTA**: "Invite to visit the unit in Bhiwandi" or "Request sample swatches for a mock-up".
           - **Tone**: Owner-to-Owner, Industrial, Experienced.

        2. **FREELANCE / WEB DEV**:
           - **Hook**: "I am a Full-Stack Automation Expert & Web Developer."
           - **Skills**: Highlight n8n, Google Gemini AI API, WordPress, WooCommerce.
           - **Value**: Focus on automating their workflow or fixing their payment issues.
           - **Tone**: Technical, Solution-oriented.

        3. **EN590 / DIESEL TRADE**:
           - **Role**: Explicitly state: "I act as a Commission-based Intermediary/Broker."
           - **Action**: Ask for "Official SCO" (if buying) or "LOI/ICPO" (if selling).
           - **Key Terms**: Mention "Non-circumvention", "Commission Protection", "FOB Rotterdam", "Dip & Pay".
           - **Tone**: Strict, Formal, Commodities Trading Standard. Brevity is key.

        4. **PARTNERSHIP**:
           - Focus on "Long-term collaboration" and "Referral commissions".

        Output only the body of the email.
        End with:
        ${profile.signature}
      `;

      const response = await this.ai.models.generateContent({
        model,
        contents: prompt
      });

      return response.text || "Could not generate text.";
    } catch (error) {
      console.error("Gemini Pitch Error:", error);
      return "Error generating text. Please check API key or try again.";
    }
  }
}