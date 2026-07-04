// Runtime configuration. Values are read from Vite env vars when available and
// fall back to localStorage overrides (set via the in-app Setup screen) so the
// demo works even without a build-time .env file.

type ConfigKey =
  | "SUPABASE_URL"
  | "SUPABASE_ANON_KEY"
  | "CLOUDINARY_CLOUD_NAME"
  | "CLOUDINARY_UPLOAD_PRESET";

const ENV_MAP: Record<ConfigKey, string | undefined> = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined,
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined,
};

const LS_PREFIX = "nexus_cfg_";

export function getConfig(key: ConfigKey): string {
  const env = ENV_MAP[key];
  if (env && env.trim()) return env.trim();
  if (typeof window !== "undefined") {
    const ls = window.localStorage.getItem(LS_PREFIX + key);
    if (ls && ls.trim()) return ls.trim();
  }
  return "";
}

export function setConfig(key: ConfigKey, value: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LS_PREFIX + key, value.trim());
  }
}

export function isConfigured(): boolean {
  return Boolean(
    getConfig("SUPABASE_URL") &&
      getConfig("SUPABASE_ANON_KEY") &&
      getConfig("CLOUDINARY_CLOUD_NAME") &&
      getConfig("CLOUDINARY_UPLOAD_PRESET"),
  );
}

export const CONFIG_KEYS: { key: ConfigKey; label: string; hint: string }[] = [
  { key: "SUPABASE_URL", label: "Supabase URL", hint: "https://xxxx.supabase.co" },
  { key: "SUPABASE_ANON_KEY", label: "Supabase Anon Key", hint: "eyJhbGci..." },
  { key: "CLOUDINARY_CLOUD_NAME", label: "Cloudinary Cloud Name", hint: "your-cloud" },
  { key: "CLOUDINARY_UPLOAD_PRESET", label: "Cloudinary Unsigned Preset", hint: "unsigned_preset" },
];
