import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Trash2,
  RefreshCw,
  Settings,
  FolderOpen,
  ShieldAlert,
} from "lucide-react";
import {
  loadConfig,
  loadTotalFreed,
  addFreedBytes,
  AppConfig,
} from "./lib/store";
import { formatBytes } from "./lib/utils";
import "./App.css";

interface ScanResult {
  path: string;
  size_bytes: number;
}

function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [totalFreed, setTotalFreed] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const c = await loadConfig();
      setConfig(c);
      const freed = await loadTotalFreed();
      setTotalFreed(freed);
    }
    init();
  }, []);

  const scan = async () => {
    if (!config) return;
    setIsScanning(true);
    setError(null);
    try {
      // The core needs absolute paths. We simulate expanding `~/` here if needed,
      // but passing it as-is relies on the user typing the right absolute path for now.
      const res: ScanResult[] = await invoke("scan_folders", { config });
      setResults(res.sort((a, b) => b.size_bytes - a.size_bytes));
    } catch (err) {
      setError(String(err));
    } finally {
      setIsScanning(false);
    }
  };

  const removeFolder = async (path: string, size: number) => {
    try {
      await invoke("trash_folder", { path });
      setResults((prev) => prev.filter((r) => r.path !== path));
      const newTotal = await addFreedBytes(size);
      setTotalFreed(newTotal);
    } catch (err) {
      setError(String(err));
    }
  };

  const totalSizeFound = results.reduce(
    (acc, curr) => acc + curr.size_bytes,
    0,
  );

  return (
    <main className="w-full h-screen bg-zinc-900 text-zinc-100 flex flex-col font-sans overflow-hidden border border-zinc-800 rounded-xl shadow-2xl">
      {/* Header */}
      <header className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <FolderOpen className="text-emerald-400 w-5 h-5" />
          <h1 className="font-semibold text-sm tracking-wide">Unballast</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={scan}
            disabled={isScanning}
            className="text-zinc-400 hover:text-white transition-colors"
            title="Scan Now"
          >
            <RefreshCw
              className={`w-4 h-4 ${isScanning ? "animate-spin text-emerald-400" : ""}`}
            />
          </button>{" "}
          <button
            className="text-zinc-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Gamification Metric */}
      <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex flex-col gap-1 items-center justify-center shrink-0 shadow-inner">
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
          Lifetime Space Freed
        </span>
        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          {formatBytes(totalFreed)}
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-2 border-red-500 p-3 m-4 text-xs text-red-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {results.length === 0 && !isScanning && !error && (
          <div className="text-center text-zinc-500 text-sm mt-10">
            <p>No heavy dependencies found.</p>
            <p className="text-xs mt-1">Click the refresh icon to scan.</p>
          </div>
        )}

        {isScanning && results.length === 0 && (
          <div className="text-center text-zinc-500 text-sm mt-10 animate-pulse">
            Scanning directories... this might take a minute.
          </div>
        )}

        {results.map((r, i) => (
          <div
            key={i}
            className="group bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 p-3 rounded-lg flex justify-between items-center transition-all duration-200"
          >
            <div className="flex flex-col overflow-hidden pr-4">
              <span
                className="text-xs text-zinc-300 truncate font-medium"
                title={r.path}
              >
                {/* Truncate path beautifully showing the end */}
                &hellip;{r.path.slice(-40)}
              </span>
              <span className="text-xs text-zinc-500 mt-0.5">
                {formatBytes(r.size_bytes)}
              </span>
            </div>

            <button
              onClick={() => removeFolder(r.path, r.size_bytes)}
              className="shrink-0 p-2 bg-zinc-900 border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-md transition-colors"
              title="Move to Bin"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {results.length > 0 && (
        <footer className="p-3 bg-zinc-950/80 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400 shrink-0">
          <span>Found {results.length} folders</span>
          <span className="font-medium text-emerald-400">
            Total: {formatBytes(totalSizeFound)}
          </span>
        </footer>
      )}
    </main>
  );
}

export default App;
