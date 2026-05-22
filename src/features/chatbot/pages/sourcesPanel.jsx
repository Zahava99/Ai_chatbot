import { useState } from "react";
import { Plus, FileText, Search, Globe, Zap, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function SourcesPanel({ collapsed, onToggle }) {
  const [searchValue, setSearchValue] = useState("");

  if (collapsed) {
    return (
      <section className="flex flex-col items-center pt-3 h-full">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          title="Expand sources"
        >
          <PanelLeftOpen size={16} />
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-medium text-white/90">Sources</span>
        <button
          onClick={onToggle}
          className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          title="Collapse sources"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Add sources button */}
      <div className="px-3 pt-3 pb-2">
        <button className="flex items-center gap-2 w-full justify-center py-2 rounded-lg border border-white/15 hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors">
          <Plus size={14} />
          Add sources
        </button>
      </div>

      {/* Search label */}
      {/* <div className="px-4 pt-1 pb-1.5">
        <p className="text-xs text-white/40">Search the web for new sources</p>
      </div> */}

      {/* Search input */}
      {/* <div className="px-3 pb-2">
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus-within:border-white/25 transition-colors">
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder=""
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none min-w-0"
          />
          <button className="text-white/40 hover:text-white transition-colors shrink-0">
            <Search size={13} />
          </button>
        </div>
      </div> */}

      {/* Filter chips */}
      {/* <div className="px-3 pb-3 flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white/70 hover:text-white transition-colors">
          <Globe size={11} />
          Web
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="opacity-50">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white/70 hover:text-white transition-colors">
          <Zap size={11} />
          Fast Research
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="opacity-50">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div> */}

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <FileText size={28} className="text-white/20 mb-1" />
        <p className="text-sm text-white/50 leading-snug">
          Saved sources will appear here
        </p>
        <p className="text-xs text-white/30 leading-snug">
          Click Add source above to add PDFs, websites, text, videos, or audio files. Or import a file directly from Google Drive.
        </p>
      </div>
    </section>
  );
}
