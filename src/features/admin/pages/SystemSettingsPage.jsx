import { useState } from "react";
import { Eye, EyeOff, Save, ChevronDown } from "lucide-react";

const EMBEDDING_MODELS = ["multilingual-e5-base", "bge-m3", "PhoBERT", "OpenAI text-embedding-3-small"];

export default function SystemSettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState("sk-••••••••••••••••••••••••••••••••");
  const [embeddingModel, setEmbeddingModel] = useState(EMBEDDING_MODELS[0]);
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap] = useState(64);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">System Settings</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Configure API keys and default model settings</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* API Keys */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-4">API Keys</p>
          <div className="flex flex-col gap-4">
            {[
              { label: "OpenAI API Key", placeholder: "sk-..." },
              { label: "Cohere API Key", placeholder: "co-..." },
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <label className="block text-sm text-app opacity-60 mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    defaultValue={label === "OpenAI API Key" ? apiKey : ""}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 hover:opacity-80 transition-opacity"
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Default embedding model */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-4">Default Embedding Model</p>
          <div className="relative">
            <select
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app outline-none appearance-none focus:border-emerald-500 transition"
            >
              {EMBEDDING_MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
          </div>
        </div>

        {/* Default chunk settings */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-4">Default Chunk Settings</p>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-app opacity-60">Default Chunk Size</label>
                <span className="text-sm text-app font-medium">{chunkSize} tokens</span>
              </div>
              <input type="range" min={128} max={2048} step={64} value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value))} className="w-full accent-emerald-500" />
              <div className="flex justify-between text-xs text-app opacity-30 mt-1"><span>128</span><span>2048</span></div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-app opacity-60">Default Overlap</label>
                <span className="text-sm text-app font-medium">{overlap} tokens</span>
              </div>
              <input type="range" min={0} max={256} step={16} value={overlap} onChange={(e) => setOverlap(Number(e.target.value))} className="w-full accent-emerald-500" />
              <div className="flex justify-between text-xs text-app opacity-30 mt-1"><span>0</span><span>256</span></div>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${saved ? "bg-emerald-500 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
        >
          <Save size={15} />
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
