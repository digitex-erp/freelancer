

interface AIProvider {
  name: string;
  apiKey: string | undefined;
  model: string;
  available: boolean;
}

interface AIAnalysis {
  score: number;
  domain: string;
  keywords: string[];
  reasoning: string;
  provider: string; // Which AI was used
}

export class MultiAIService {
  private providers: AIProvider[];
  private currentProviderIndex: number = 0;

  constructor() {
    // Initialize all available AI providers
    this.providers = [
      {
        name: 'Gemini',
        apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
        model: 'gemini-2.5-flash', 
        available: !!(process.env.GEMINI_API_KEY || process.env.API_KEY)
      },
      {
        name: 'OpenAI',
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini', // Efficient and cheap model
        available: !!process.env.OPENAI_API_KEY
      },
      {
        name: 'DeepSeek',
        apiKey: process.env.DEEPSEEK_API_KEY,
        model: 'deepseek-chat',
        available: !!process.env.DEEPSEEK_API_KEY
      },
      {
        name: 'Perplexity',
        apiKey: process.env.PERPLEXITY_API_KEY,
        model: 'llama-3.1-sonar-small-128k-online',
        available: !!process.env.PERPLEXITY_API_KEY
      },
      {
        name: 'Grok',
        apiKey: process.env.GROK_API_KEY,
        model: 'grok-beta',
        available: !!process.env.GROK_API_KEY
      },
      {
        name: 'Kimi',
        apiKey: process.env.KIMI_API_KEY,
        model: 'moonshot-v1-8k',
        available: !!process.env.KIMI_API_KEY
      }
    ].filter(p => p.available); // Only keep providers with API keys

    console.log(`✅ Available AI providers: ${this.providers.map(p => p.name).join(', ')}`);
  }

  // Get current provider
  private getCurrentProvider(): AIProvider | null {
    if (this.providers.length === 0) {
      console.error('❌ No AI providers available!');
      return null;
    }
    return this.providers[this.currentProviderIndex];
  }

  // Switch to next provider
  private switchToNextProvider(): boolean {
    this.currentProviderIndex++;
    if (this.currentProviderIndex >= this.providers.length) {
      console.error('❌ All AI providers exhausted');
      return false;
    }
    const newProvider = this.getCurrentProvider();
    console.log(`🔄 Switching to: ${newProvider?.name}`);
    return true;
  }

  /**
   * Forces the service to use a specific provider for testing purposes.
   */
  async testSpecificProvider(providerName: string, prompt: string): Promise<string> {
    const provider = this.providers.find(p => p.name.toLowerCase() === providerName.toLowerCase());
    if (!provider) {
      throw new Error(`Provider ${providerName} not found or not configured with an API Key.`);
    }
    return await this.callProvider(provider, prompt);
  }

  // Call specific AI provider
  private async callProvider(provider: AIProvider, prompt: string): Promise<string> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`🤖 Calling ${provider.name} (attempt ${attempt + 1}/${maxRetries})`);

        switch (provider.name) {
          case 'Gemini':
            return await this.callGemini(provider, prompt);
          
          case 'OpenAI':
            return await this.callOpenAI(provider, prompt);
          
          case 'DeepSeek':
            return await this.callDeepSeek(provider, prompt);
          
          case 'Perplexity':
            return await this.callPerplexity(provider, prompt);
          
          case 'Grok':
            return await this.callGrok(provider, prompt);
          
          case 'Kimi':
            return await this.callKimi(provider, prompt);
          
          default:
            throw new Error(`Unknown provider: ${provider.name}`);
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ ${provider.name} attempt ${attempt + 1} failed:`, error.message);
        
        // Wait before retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw lastError || new Error(`${provider.name} failed after ${maxRetries} attempts`);
  }

  // Gemini API
  private async callGemini(provider: AIProvider, prompt: string): Promise<string> {
    // Use v1beta API URL
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // OpenAI API
  private async callOpenAI(provider: AIProvider, prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // DeepSeek API
  private async callDeepSeek(provider: AIProvider, prompt: string): Promise<string> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Perplexity API
  private async callPerplexity(provider: AIProvider, prompt: string): Promise<string> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Grok API (X.AI)
  private async callGrok(provider: AIProvider, prompt: string): Promise<string> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Grok API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Kimi API (Moonshot)
  private async callKimi(provider: AIProvider, prompt: string): Promise<string> {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kimi API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Main analysis function with fallback
  async analyzeLead(title: string, description: string): Promise<AIAnalysis> {
    const prompt = `Analyze this opportunity for Vishal Pendharkar.

Profile:
- Web Developer (WordPress, React, n8n automation, blockchain)
- Fabric Sample Book Manufacturer (25 years experience, Bhiwandi)
- EN590 Trading (commission-based broker)
- Payment Partnership Referrals

Job:
Title: ${title}
Description: ${description}

Return ONLY valid JSON (no markdown) with this structure:
{
  "score": 0-100,
  "domain": "FREELANCE"|"FABRIC_MANUFACTURING"|"EN590"|"EXPORT_TRADE"|"PARTNERSHIP"|"IGNORE",
  "keywords": ["keyword1", "keyword2"],
  "reasoning": "brief explanation"
}`;

    // Try each provider in sequence
    while (this.currentProviderIndex < this.providers.length) {
      const provider = this.getCurrentProvider();
      if (!provider) break;

      try {
        const rawResponse = await this.callProvider(provider, prompt);
        
        // Clean and parse JSON
        const cleanText = rawResponse
          .replace(/```json\n?|\n?```/g, '')
          .replace(/```\n?|\n?```/g, '')
          .trim();
        
        const parsed = JSON.parse(cleanText);
        
        // Success! Return with provider info
        console.log(`✅ ${provider.name} succeeded`);
        return {
          ...parsed,
          provider: provider.name
        };
        
      } catch (error: any) {
        console.error(`❌ ${provider?.name} failed:`, error.message);
        
        // Try next provider
        if (!this.switchToNextProvider()) {
          // All providers failed - return fallback
          console.warn('⚠️ All AI providers failed, using fallback analysis');
          return {
            score: 50,
            domain: 'FREELANCE',
            keywords: ['unknown'],
            reasoning: 'All AI providers failed, manual review needed',
            provider: 'fallback'
          };
        }
      }
    }

    // Fallback if loop breaks unexpectedly
    return {
       score: 50,
       domain: 'FREELANCE',
       keywords: ['unknown'],
       reasoning: 'All AI providers exhausted',
       provider: 'fallback'
    };
  }

  // Reset to first provider (call this before each batch)
  reset() {
    this.currentProviderIndex = 0;
  }
}
