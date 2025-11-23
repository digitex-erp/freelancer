import React, { useState, useEffect } from 'react';

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: string;
  title: string;
  recipientEmail?: string | null;
}

// Helper for safe JSON fetching to avoid "Unexpected token" errors
async function safeFetchJson(url: string, opts?: RequestInit) {
  const resp = await fetch(url, opts);
  const text = await resp.text();
  try {
    const json = JSON.parse(text);
    if (!resp.ok) throw { ok: false, status: resp.status, body: json };
    return json;
  } catch (err: any) {
    if (err.body) throw err; // It was valid JSON but error status
    // Non-JSON response (likely HTML error page or plain text)
    throw { isNonJson: true, status: resp.status, text };
  }
}

const PitchModal: React.FC<PitchModalProps> = ({ isOpen, onClose, pitch, title, recipientEmail }) => {
  const [isSending, setIsSending] = useState(false);
  const [emailTo, setEmailTo] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmailTo(recipientEmail || '');
    }
  }, [isOpen, recipientEmail]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pitch);
    alert("Pitch copied to clipboard!");
  };

  const handleAutoSend = async () => {
    const to = emailTo.trim();
    
    if (!to) {
      alert("Please enter a recipient email address manually.");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      alert("Please enter a valid email address.");
      return;
    }
    
    setIsSending(true);
    try {
      const data = await safeFetchJson('/api/send-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: to,
          subject: `Regarding: ${title}`,
          body: pitch 
        })
      });

      if (data.success || data.ok) {
        alert(`✅ Agent successfully sent the pitch to ${to}`);
        onClose();
      } else {
        const errMsg = data.error || data.message || 'Unknown error';
        alert(`❌ Agent failed to send: ${errMsg}`);
      }
    } catch (error: any) {
      if (error.isNonJson) {
        console.error("Server returned non-JSON:", error.text);
        alert(`❌ Server Error (Non-JSON): ${error.status}\nSee console for details.`);
      } else if (error.body) {
         alert(`❌ Send Failed: ${error.body.error || error.body.message || 'Unknown error'}`);
      } else {
         alert("❌ Network error: " + (error.message || String(error)));
      }
    } finally {
      setIsSending(false);
    }
  };

  const gmailLink = emailTo 
    ? `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(`Regarding: ${title}`)}&body=${encodeURIComponent(pitch)}`
    : '#';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
          <div>
             <h3 className="text-xl font-bold text-white">Generated Pitch</h3>
             <p className="text-xs text-indigo-400 truncate max-w-md">{title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          
          {/* Recipient Field - Always Editable */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
             <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 flex justify-between items-center">
                <span>Recipient Email (To:)</span>
                {!recipientEmail && <span className="text-amber-500 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i> Manual Input Required</span>}
             </label>
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className={`fas ${emailTo ? 'fa-envelope text-emerald-500' : 'fa-pen text-slate-500'} transition-colors`}></i>
                </div>
                <input 
                    type="email" 
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="Enter recipient email..."
                    className={`w-full bg-slate-900 border rounded-lg pl-10 pr-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all font-mono
                        ${emailTo 
                           ? 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20' 
                           : 'border-amber-500/50 focus:border-amber-500 focus:ring-amber-500/20'
                        }
                    `}
                />
             </div>
             <p className="text-[10px] text-slate-500 mt-2">
                {emailTo ? 'Ready to send via Agent or Gmail.' : 'Agent could not extract an email. Please find it on the job source and paste it here.'}
             </p>
          </div>

          {/* Pitch Content */}
          <div className="flex-1 flex flex-col min-h-0">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                Email Body
              </label>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex-1 min-h-[200px] overflow-y-auto custom-scrollbar shadow-inner">
                <pre className="whitespace-pre-wrap text-slate-300 font-sans text-sm leading-relaxed">
                  {pitch}
                </pre>
              </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-700 flex flex-wrap justify-end gap-3 bg-slate-800/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Cancel
          </button>
          
          <button 
            onClick={handleCopy} 
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors border border-slate-600 shadow-sm"
          >
            <i className="fas fa-copy mr-2"></i> Copy
          </button>

          <a 
            href={gmailLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !emailTo && e.preventDefault()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center border border-transparent ${emailTo ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'}`}
          >
            <i className="fab fa-google mr-2"></i> Gmail
          </a>

          <button 
            onClick={handleAutoSend}
            disabled={isSending || !emailTo}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center border border-transparent
              ${isSending || !emailTo 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              }
            `}
          >
             {isSending ? (
               <><i className="fas fa-circle-notch fa-spin mr-2"></i> Sending...</>
             ) : (
               <><i className="fas fa-paper-plane mr-2"></i> Auto-Send</>
             )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitchModal;