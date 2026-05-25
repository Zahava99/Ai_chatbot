import { FileText, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function SourcesPanel({ collapsed, onToggle }) {
  if (collapsed) {
    return (
      <section className="flex flex-col items-center pt-3 h-full">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-app opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
        <span className="text-sm font-medium text-app opacity-90">Sources</span>
        <button
          onClick={onToggle}
          className="p-1 rounded-md text-app opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Collapse sources"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Add sources button */}
      <div className="px-3 pt-3 pb-2">
        <button className="flex items-center gap-2 w-full justify-center py-2 rounded-lg border border-app-border hover:bg-black/5 dark:hover:bg-white/5 text-sm text-app opacity-70 hover:opacity-100 transition-colors">
          <Plus size={14} />
          Add sources
        </button>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <FileText size={28} className="text-app opacity-20 mb-1" />
        <p className="text-sm text-app opacity-50 leading-snug">
          Saved sources will appear here
        </p>
        <p className="text-xs text-app opacity-30 leading-snug">
          Click Add source above to add PDFs, websites, text, videos, or audio files.
        </p>
      </div>
    </section>
  );
}
