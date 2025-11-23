import React from 'react';
import { Job, JobCategory } from '../types';

interface JobCardProps {
  job: Job;
  onAnalyze: (job: Job) => void;
  onGeneratePitch: (job: Job) => void;
  isProcessing: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onAnalyze, onGeneratePitch, isProcessing }) => {

  const getBadgeColor = (cat?: JobCategory) => {
    switch (cat) {
      case JobCategory.FABRIC_MANUFACTURING: return 'bg-rose-900/50 text-rose-200 border-rose-500/50';
      case JobCategory.EN590: return 'bg-purple-900/50 text-purple-200 border-purple-500/50';
      case JobCategory.EXPORT_TRADE: return 'bg-amber-900/50 text-amber-200 border-amber-500/50';
      case JobCategory.FREELANCE: return 'bg-blue-900/50 text-blue-200 border-blue-500/50';
      case JobCategory.PARTNERSHIP: return 'bg-emerald-900/50 text-emerald-200 border-emerald-500/50';
      case JobCategory.FULL_TIME_ROLE: return 'bg-cyan-900/50 text-cyan-200 border-cyan-500/50';
      case JobCategory.IGNORE: return 'bg-gray-700/50 text-gray-400 border-gray-600';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('upwork')) return 'fab fa-upwork text-green-500';
    if (s.includes('reddit')) return 'fab fa-reddit text-orange-500';
    if (s.includes('linkedin')) return 'fab fa-linkedin text-blue-500';
    if (s.includes('github')) return 'fab fa-github text-white';
    if (s.includes('craigslist')) return 'fas fa-list text-purple-400';
    if (s.includes('textile') || s.includes('b2b') || s.includes('indiamart') || s.includes('alibaba')) return 'fas fa-industry text-rose-400';
    if (s.includes('trade') || s.includes('commodities')) return 'fas fa-ship text-amber-500';
    if (s.includes('inbox') || s.includes('email')) return 'fas fa-envelope text-indigo-400';
    return 'fas fa-rss text-slate-400';
  };

  const isReply = job.type === 'reply';
  const contacts = job.analysis?.contacts;
  const hasContacts = (contacts && (contacts.name || contacts.email || contacts.phone || contacts.company)) || job.email;

  return (
    <div className={`border rounded-xl p-5 shadow-lg hover:shadow-xl transition-all mb-4 relative overflow-hidden group ${isReply ? 'bg-slate-900/80 border-indigo-500/30 hover:border-indigo-500/50' : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'}`}>

      {isReply && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-bl-lg font-bold shadow-sm">
          <i className="fas fa-reply mr-1"></i> INCOMING REPLY
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="pr-20">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
            <a href={String(job.id).startsWith('http') ? String(job.id) : '#'} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-slate-500 underline-offset-4">
              {job.title}
            </a>
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-2 mt-1.5">
            <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-700/50">
              <i className={getSourceIcon(job.source)}></i> {job.source}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span>{new Date(job.date).toLocaleDateString()}</span>
          </p>
        </div>
        {job.analysis && (
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getBadgeColor(job.analysis.category)}`}>
            {job.analysis.category === 'FABRIC_MANUFACTURING' ? 'MANUFACTURING' : job.analysis.category} <span className="opacity-75 ml-1">({job.analysis.matchScore}%)</span>
          </div>
        )}
      </div>

      <p className={`text-slate-300 text-sm mb-4 leading-relaxed ${isReply ? 'italic bg-indigo-900/10 p-3 rounded border-l-2 border-indigo-500/50' : 'line-clamp-3'}`}>
        {isReply ? `"${job.description}"` : job.description}
      </p>

      {hasContacts && (
        <div className="bg-slate-900/60 p-4 rounded-lg border border-emerald-500/30 mb-4 text-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <h4 className="text-emerald-400 text-[11px] uppercase font-bold mb-3 tracking-wider flex items-center gap-2">
            <i className="fas fa-address-card"></i> Extracted Lead Data
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contacts?.name && (
              <div className="text-slate-200 flex items-center gap-2">
                <i className="fas fa-user w-5 text-center text-slate-500"></i>
                <span className="font-medium">{contacts.name}</span>
              </div>
            )}
            {contacts?.company && (
              <div className="text-slate-200 flex items-center gap-2">
                <i className="fas fa-building w-5 text-center text-slate-500"></i>
                <span>{contacts.company}</span>
              </div>
            )}
            {(contacts?.email || job.email) && (
              <div className="text-slate-200 flex items-center gap-2 col-span-1 md:col-span-2 bg-emerald-900/20 p-2 rounded border border-emerald-900/50">
                <i className="fas fa-envelope w-5 text-center text-emerald-500"></i>
                <a href={`mailto:${contacts?.email || job.email}`} className="text-emerald-300 hover:text-emerald-200 hover:underline">
                  {contacts?.email || job.email}
                </a>
              </div>
            )}
            {contacts?.phone && (
              <div className="text-slate-200 flex items-center gap-2">
                <i className="fas fa-phone w-5 text-center text-slate-500"></i>
                <a href={`tel:${contacts.phone}`} className="text-slate-300 hover:text-white hover:underline">
                  {contacts.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {job.analysis && (
        <div className="bg-slate-950/30 p-3 rounded-lg mb-4 border border-slate-800">
          <p className="text-xs text-slate-400 italic flex gap-2">
            <i className="fas fa-brain mt-0.5 text-indigo-400"></i>
            <span>
              <span className="font-semibold text-indigo-300">{isReply ? 'Strategy:' : 'Logic:'}</span> {job.analysis.shortReason}
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-2 pt-2 border-t border-slate-700/30">
        {job.status === 'new' && (
          <button
            onClick={() => onAnalyze(job)}
            disabled={isProcessing}
            className="flex-1 bg-indigo-600/90 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
          >
            {isProcessing ? <><i className="fas fa-spinner fa-spin mr-2"></i> Analyzing...</> : <><i className="fas fa-microscope mr-2"></i> Analyze Lead</>}
          </button>
        )}

        {job.status === 'analyzed' && job.analysis?.category !== JobCategory.IGNORE && (
          <button
            onClick={() => onGeneratePitch(job)}
            disabled={isProcessing}
            className="flex-1 bg-emerald-600/90 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-lg shadow-emerald-900/20"
          >
            {isProcessing ? <i className="fas fa-circle-notch fa-spin"></i> : (isReply ? <><i className="fas fa-pen mr-2"></i> Draft Reply</> : <><i className="fas fa-magic mr-2"></i> Generate Pitch</>)}
          </button>
        )}

        {job.status === 'pitch_ready' && (
          <div className="flex gap-2 flex-1">
             <button className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:text-white transition-colors" title="Toggle Auto-Send">
               <i className="fas fa-robot"></i> Auto-Send
             </button>
             <button
               onClick={() => onGeneratePitch(job)}
               className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-slate-600"
             >
               <i className="fas fa-eye mr-2"></i> {isReply ? 'Review Draft' : 'Review Pitch'}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
