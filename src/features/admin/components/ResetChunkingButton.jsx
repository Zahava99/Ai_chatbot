import { RotateCcw } from "lucide-react";

/**
 * Button that resets chunk size & overlap to the selected strategy's defaults.
 * Parses the `detail` field (e.g. "size 500 / overlap 0") from the strategy list.
 */
export default function ResetChunkingButton({
  chunkingStrategies,
  activeChunkingStrategyId,
  onReset,
}) {
  function handleReset() {
    const selected = chunkingStrategies.find(
      (s) => String(s.id) === String(activeChunkingStrategyId)
    );

    if (selected?.detail) {
      const sizeMatch = selected.detail.match(/size\s+(\d+)/i);
      const overlapMatch = selected.detail.match(/overlap\s+(\d+)/i);
      onReset({
        chunkSize: sizeMatch ? sizeMatch[1] : "",
        chunkOverlap: overlapMatch ? overlapMatch[1] : "",
      });
    } else {
      onReset({ chunkSize: "", chunkOverlap: "" });
    }
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
    >
      <RotateCcw size={12} />
      Reset to default
    </button>
  );
}
