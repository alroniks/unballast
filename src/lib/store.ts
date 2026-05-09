import { load } from "@tauri-apps/plugin-store";

export interface AppConfig {
  root_path: string;
  targets: string[];
  exclusions: string[];
}

const STORE_FILENAME = "unballast_settings.json";

const DEFAULT_CONFIG: AppConfig = {
  root_path: "~/", // Note: Rust expects absolute, so we expand this in Rust or JS
  targets: ["node_modules"],
  exclusions: [
    ".git",
    "Library",
    "Applications",
    "Pictures",
    "Music",
    "Movies",
    "Downloads",
  ],
};

export async function getStore() {
  return await load(STORE_FILENAME, {
    autoSave: true,
    defaults: { config: DEFAULT_CONFIG, total_freed_bytes: 0 },
  });
}

export async function loadConfig(): Promise<AppConfig> {
  const store = await getStore();
  const config = await store.get<AppConfig>("config");
  if (!config) {
    await store.set("config", DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
  return config;
}

export async function saveConfig(config: AppConfig): Promise<void> {
  const store = await getStore();
  await store.set("config", config);
}

export async function loadTotalFreed(): Promise<number> {
  const store = await getStore();
  const bytes = await store.get<number>("total_freed_bytes");
  return bytes ?? 0;
}

export async function addFreedBytes(bytes: number): Promise<number> {
  const store = await getStore();
  const current = await loadTotalFreed();
  const newTotal = current + bytes;
  await store.set("total_freed_bytes", newTotal);
  return newTotal;
}
