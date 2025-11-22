import React, { useState, useEffect } from 'react';
import { Job, Agent, JobCategory } from './types';
import { AGENTS_LIST, MOCK_JOBS, VISHAL_PROFILE } from './constants';
import JobCard from './components/JobCard';
import PitchModal from './components/PitchModal';
import ExportDrafts from './components/ExportDrafts';
import { GeminiService } from './services/geminiService';

export default function App() {
  const [activeView, setActiveView] = useState<'feed' | 'drafts'>('feed');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>(AGENTS_LIST);
  const [useClientSideAI, setUseClientSideAI] = useState(false);
  
  // Client-side AI Service (Lazy loaded)
  const [geminiService] = useState(() => new GeminiService(process.env.API_KEY || ''));
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPitch, setCurrentPitch] = useState('');
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?limit=50');
      
      // Check for valid JSON response (Vite sometimes returns HTML for 404s)
      const contentType = res.headers.get("content-type");
      if (!res.ok || (contentType && contentType.includes("text/html"))) {
        throw new Error("Backend API not available (using client-side mode)");
      }
      
      const text = await res.text();
      const data = JSON.parse(text);
      
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        console.warn("API returned non-array, using mock data:", data);
        setJobs(MOCK_JOBS);
      }
    } catch (e) {
      console.warn("Running in Client-Side Mode (Backend unreachable):", e);
      setUseClientSideAI(true);
      setJobs(MOCK_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAnalyze = async (job: Job) => {
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'analyzing' } : j));
    
    try {
      let analysis;
      
      if (useClientSideAI) {
        console.log("🤖 Agent: Analyzing via Client-Side Gemini...");
        await new Promise(r => setTimeout(r, 500)); // UI feel
        analysis = await geminiService.analyzeJob(job, VISHAL_PROFILE);
      } else {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job })
        });
        if (!res.ok) throw new Error("Analysis API failed");
        analysis = await res.json();
      }
      
      setJobs(prev => prev.map(j => j.id === job.id ? { 
        ...j, 
        status: 'analyzed',
        analysis: analysis
      } : j));

    } catch (e) {
      console.error("Analysis failed, falling back to client AI:", e);
      try {
        // Final fallback if API fails mid-operation
        const fallbackAnalysis = await geminiService.analyzeJob(job, VISHAL_PROFILE);
        setJobs(prev => prev.map(j => j.id === job.id ? { 
            ...j, 
            status: 'analyzed',
            analysis: fallbackAnalysis
        } : j));
        setUseClientSideAI(true); // Switch mode for future actions
      } catch (aiError) {
         console.error("Critical AI Error:", aiError);
         alert("Failed to analyze. Please check your API Key.");
         setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'new' } : j));
      }
    }
  };

  const handleGeneratePitch = async (job: Job) => {
    if (!job.analysis) return;
    
    if (job.analysis.pitch) {
       setCurrentJob(job);
       const p = job.analysis.pitch;
       setCurrentPitch(typeof p === 'string' ? p : (p.body || ''));
       setModalOpen(true);
       return;
    }

    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'analyzing' } : j));

    try {
      let pitchText = "";

      if (useClientSideAI) {
        console.log("🤖 Agent: Generating Pitch via Client-Side Gemini...");
        pitchText = await geminiService.generatePitch(job, job.analysis, VISHAL_PROFILE);
      } else {
        const res = await fetch('/api/pitch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job, analysis: job.analysis })
        });
        if (!res.ok) throw new Error("Pitch API failed");
        const data = await res.json();
        pitchText = data.pitch;
      }
      
      setCurrentJob(job);
      setCurrentPitch(pitchText);
      setModalOpen(true);
      
      setJobs(prev => prev.map(j => j.id === job.id ? { 
        ...j, 
        status: 'pitch_ready',
        pitch: pitchText
      } : j));

    } catch (e) {
      console.error("Pitch gen failed, trying client fallback:", e);
      // Fallback
      try {
        const fallbackPitch = await geminiService.generatePitch(job, job.analysis, VISHAL_PROFILE);
        setCurrentJob(job);
        setCurrentPitch(fallbackPitch);
        setModalOpen(true);
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'pitch_ready', pitch: fallbackPitch } : j));
        setUseClientSideAI(true);
      } catch (aiError) {
        alert("Could not generate pitch.");
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'analyzed' } : j));
      }
    }
  };
  
  const triggerHunter = async () => {
     if(!confirm("Run Hunter Agent? This scrapes live feeds.")) return;
     setLoading(true);
     
     if (useClientSideAI) {
       // Client side simulation
       try {
         const simulatedJobs = await geminiService.simulateJobSearch("Freelance WordPress and Fabric Manufacturing");
         setJobs(prev => [...simulatedJobs, ...prev]);
         alert(`Agent found ${simulatedJobs.length} new leads via simulation.`);
       } catch (e) {
         alert("Agent failed to hunt.");
       }
       setLoading(false);
       return;
     }

     try {
        await fetch('/api/cron/fetch-leads');
        await fetchLeads();
     } catch(e) {
        alert("Hunter triggered (Background check required)");
     } finally {
        setLoading(false);
     }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
       {/* Header */}
       <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <i className="fas fa-robot text-white"></i>
               </div>
               <h1 className="font-bold text-lg tracking-tight text-white">Bell24h <span className="text-slate-500 font-normal">Agent</span></h1>
               {useClientSideAI && (
                 <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                   CLIENT_MODE
                 </span>
               )}
            </div>
            
            <nav className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
               <button onClick={() => setActiveView('feed')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === 'feed' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                  Feed
               </button>
               <button onClick={() => setActiveView('drafts')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === 'drafts' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                  Drafts
               </button>
            </nav>

            <button onClick={triggerHunter} disabled={loading} className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2">
                <i className={`fas fa-satellite-dish ${loading ? 'fa-spin' : ''}`}></i>
                {loading ? 'Hunting...' : 'Run Hunter'}
            </button>
         </div>
       </header>

       <main className="max-w-7xl mx-auto px-4 py-8">
          {activeView === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Stats/Agents */}
                <div className="lg:col-span-3 space-y-6">
                   <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Active Agents</h2>
                      <div className="space-y-3">
                         {agents.map(agent => (
                            <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${agent.id === 'hunter' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                  <i className={`fas ${agent.icon}`}></i>
                               </div>
                               <div>
                                  <div className="text-sm font-medium text-slate-200">{agent.name}</div>
                                  <div className="text-[10px] text-slate-500">{agent.role}</div>
                               </div>
                               {loading && agent.id === 'hunter' && <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Center: Feed */}
                <div className="lg:col-span-9">
                   <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">Incoming Leads <span className="ml-2 text-sm font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">{jobs.length}</span></h2>
                      <button onClick={fetchLeads} className="text-slate-400 hover:text-white text-sm"><i className="fas fa-sync-alt"></i> Refresh</button>
                   </div>

                   {jobs.length === 0 ? (
                      <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                         <i className="fas fa-inbox text-4xl text-slate-700 mb-4"></i>
                         <p className="text-slate-500">No leads found. Run the Hunter agent.</p>
                      </div>
                   ) : (
                      <div>
                         {jobs.map(job => (
                            <JobCard 
                               key={job.id} 
                               job={job} 
                               onAnalyze={handleAnalyze}
                               onGeneratePitch={handleGeneratePitch}
                               isProcessing={job.status === 'analyzing'}
                            />
                         ))}
                      </div>
                   )}
                </div>
            </div>
          )}

          {activeView === 'drafts' && (
             <ExportDrafts />
          )}
       </main>

       <PitchModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          pitch={currentPitch}
          title={currentJob?.title || ''}
          recipientEmail={currentJob?.email || currentJob?.analysis?.contacts?.email}
       />
    </div>
  );
}