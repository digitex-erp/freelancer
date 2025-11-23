import React, { useEffect, useState } from "react";

interface Draft {
  id: string | number;
  title: string;
  country: string;
  product?: string;
  email?: string;
  pitch_body?: string;
  pitch_subject?: string;
}

const ExportDrafts: React.FC = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | number | null>(null);

  async function fetchDrafts() {
    setLoading(true);
    try {
      const res = await fetch("/api/export/drafts");
      const j = await res.json();
      if (j.ok) setDrafts(j.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDrafts(); }, []);

  async function handleSend(leadId: string | number) {
    if (!confirm("Are you sure you want to send this pitch now?")) return;
    
    setSendingId(leadId);
    try {
      const res = await fetch("/api/export/send-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId })
      });
      const j = await res.json();
      if (j.ok) {
        alert("✅ Sent via " + j.provider);
        setDrafts(prev => prev.filter(d => d.id !== leadId)); // Remove from list
      } else {
        alert("❌ Send failed: " + (j.error || "Unknown error"));
      }
    } catch (e: any) {
      alert("Network error: " + e.message);
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 min-h-[80vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <i className="fas fa-file-signature text-amber-400"></i> Export Drafts
        </h2>
        <button 
          onClick={fetchDrafts} 
          disabled={loading}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          <i className={`fas fa-sync ${loading ? "fa-spin" : ""}`}></i> Refresh
        </button>
      </div>

      {loading && drafts.length === 0 && (
        <div className="text-center py-10 text-slate-500">Loading drafts...</div>
      )}

      {!loading && drafts.length === 0 && (
        <div className="text-center py-16 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
          <i className="fas fa-inbox text-4xl mb-3 opacity-40"></i>
          <p>No pending drafts found.</p>
          <p className="text-xs mt-2">Generate pitches from the Feed to see them here.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {drafts.map((d) => (
          <div key={d.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white truncate max-w-[250px]" title={d.title}>{d.title}</h3>
                <div className="flex items-center gap-2 text-xs mt-1 text-slate-400">
                   <span className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{d.country}</span>
                   {d.product && <span>• {d.product}</span>}
                </div>
              </div>
              <div className="text-right">
                 <span className="text-xs bg-amber-900/30 text-amber-500 border border-amber-500/30 px-2 py-1 rounded uppercase font-bold tracking-wider">
                   Draft
                 </span>
              </div>
            </div>

            {/* Email Preview */}
            <div className="p-4 flex-1 bg-slate-900/30">
               <div className="mb-2">
                 <span className="text-xs text-slate-500 uppercase font-semibold">To:</span> <span className="text-emerald-400 text-sm">{d.email || "No Email"}</span>
               </div>
               <div className="mb-3">
                 <span className="text-xs text-slate-500 uppercase font-semibold">Subject:</span> <span className="text-slate-200 text-sm font-medium">{d.pitch_subject}</span>
               </div>
               <div className="bg-slate-950 p-3 rounded border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap font-sans h-48 overflow-y-auto custom-scrollbar">
                 {d.pitch_body}
               </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-slate-800 border-t border-slate-700 flex justify-end gap-3">
               <button className="px-3 py-2 text-slate-400 hover:text-white text-sm transition-colors">
                 <i className="fas fa-edit"></i> Edit
               </button>
               <button 
                 onClick={() => handleSend(d.id)}
                 disabled={sendingId === d.id || !d.email}
                 className={`px-4 py-2 rounded text-sm font-medium text-white flex items-center gap-2 transition-all
                    ${sendingId === d.id ? 'bg-indigo-800 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}
                    ${!d.email ? 'opacity-50 cursor-not-allowed' : ''}
                 `}
               >
                 {sendingId === d.id ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                 Send Now
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExportDrafts;
