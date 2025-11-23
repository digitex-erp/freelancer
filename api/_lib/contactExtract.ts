
export function extractContacts(text: string) {
  const result = {
    email: null as string | null,
    phone: null as string | null,
    name: null as string | null,
    company: null as string | null
  };

  if (!text) return result;

  // EMAIL: Improved regex for broader matching (case insensitive)
  // Matches standard email addresses, ignoring common trailing punctuation
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const matches = text.match(emailRegex);
  
  if (matches && matches.length > 0) {
      // Filter out likely false positives (images, etc if scraping raw html)
      const valid = matches.filter(m => !m.match(/\.(png|jpg|jpeg|gif|css|js|webp)$/i));
      if (valid.length > 0) result.email = valid[0].toLowerCase();
  }

  // Obfuscated emails: "user [at] domain [dot] com" or "user at domain dot com"
  if (!result.email) {
      const obfRegex = /([a-zA-Z0-9._-]+)\s*(?:\[at\]|@|at)\s*([a-zA-Z0-9._-]+)\s*(?:\[dot\]|\.|dot)\s*([a-zA-Z]{2,})/i;
      const m = text.match(obfRegex);
      if (m) {
          result.email = `${m[1]}@${m[2]}.${m[3]}`.toLowerCase();
      }
  }

  // PHONE: Support international formats, needs at least 7 digits
  const phoneMatch = text.match(
    /(?:\+?\d{1,3}[ -]?)?\(?\d{2,4}\)?[ -]?\d{2,4}[ -]?\d{2,4}(?:[ -]?\d{2,4})?/
  );
  // Verify length to avoid picking up years (e.g. 2024) or small numbers
  if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length > 7) {
      result.phone = phoneMatch[0].trim();
  }

  // NAME: Simple heuristic looking for "Name:" prefix
  const nameMatch = text.match(/(?:Name|Contact|Person)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  result.name = nameMatch ? nameMatch[1].trim() : null;

  // COMPANY: Heuristic for common suffixes
  const companyMatch = text.match(
    /([A-Z][A-Za-z0-9&\-,. ]+(?:Ltd|LLC|Inc|Pvt|Company|Corp|Enterprises|Traders|Impex))/i
  );
  result.company = companyMatch ? companyMatch[1].trim() : null;

  return result;
}