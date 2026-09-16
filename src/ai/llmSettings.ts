export type LlmProviderPreset = 'openai' | 'openrouter' | 'groq' | 'custom'

export interface LlmSettings {
  /** When true, battles use the LLM instead of heuristic AI. */
  enabled: boolean
  provider: LlmProviderPreset
  apiKey: string
  baseUrl: string
  model: string
}

const STORAGE_KEY = 'wh40k-llm-settings'

const PROVIDER_PRESETS: LlmProviderPreset[] = ['openai', 'openrouter', 'groq', 'custom']

const PROVIDER_DEFAULTS: Record<LlmProviderPreset, { baseUrl: string; model: string }> = {
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  groq: { baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  custom: { baseUrl: 'http://localhost:1234/v1', model: 'local-model' },
}

export const DEFAULT_LLM_SETTINGS: LlmSettings = {
  enabled: false,
  provider: 'openai',
  apiKey: '',
  baseUrl: PROVIDER_DEFAULTS.openai.baseUrl,
  model: PROVIDER_DEFAULTS.openai.model,
}

export function getProviderDefaults(provider: LlmProviderPreset) {
  return PROVIDER_DEFAULTS[provider]
}

function parseEnvProvider(value: string | undefined): LlmProviderPreset | undefined {
  if (value && PROVIDER_PRESETS.includes(value as LlmProviderPreset)) {
    return value as LlmProviderPreset
  }
  return undefined
}

/** Optional defaults from `.env` (self-hosted / local dev). Not used on public GH Pages unless baked into a private build. */
export function getEnvLlmSettings(): Partial<LlmSettings> {
  const provider = parseEnvProvider(import.meta.env.VITE_LLM_PROVIDER)
  const out: Partial<LlmSettings> = {}

  if (import.meta.env.VITE_LLM_ENABLED === 'true') out.enabled = true
  if (import.meta.env.VITE_LLM_ENABLED === 'false') out.enabled = false
  if (provider) out.provider = provider
  if (import.meta.env.VITE_LLM_API_KEY?.trim()) {
    out.apiKey = import.meta.env.VITE_LLM_API_KEY.trim()
  }
  if (import.meta.env.VITE_LLM_BASE_URL?.trim()) {
    out.baseUrl = import.meta.env.VITE_LLM_BASE_URL.trim()
  }
  if (import.meta.env.VITE_LLM_MODEL?.trim()) {
    out.model = import.meta.env.VITE_LLM_MODEL.trim()
  }

  return out
}

export function hasEnvLlmDefaults(): boolean {
  const env = getEnvLlmSettings()
  return Boolean(env.apiKey || env.enabled || env.baseUrl || env.model || env.provider)
}

export function isApiKeyFromEnv(settings: LlmSettings): boolean {
  const envKey = import.meta.env.VITE_LLM_API_KEY?.trim()
  return Boolean(envKey && settings.apiKey === envKey)
}

function mergeWithEnvDefaults(settings: LlmSettings, env: Partial<LlmSettings>): LlmSettings {
  const provider = settings.provider ?? env.provider ?? DEFAULT_LLM_SETTINGS.provider
  const providerDefaults = PROVIDER_DEFAULTS[provider]

  return {
    enabled: settings.enabled ?? env.enabled ?? DEFAULT_LLM_SETTINGS.enabled,
    provider,
    apiKey: settings.apiKey || env.apiKey || '',
    baseUrl: settings.baseUrl || env.baseUrl || providerDefaults.baseUrl,
    model: settings.model || env.model || providerDefaults.model,
  }
}

export function loadLlmSettings(): LlmSettings {
  const env = getEnvLlmSettings()
  const envBase = mergeWithEnvDefaults(DEFAULT_LLM_SETTINGS, env)

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return envBase

    const parsed = JSON.parse(raw) as Partial<LlmSettings>
    return mergeWithEnvDefaults(
      {
        ...DEFAULT_LLM_SETTINGS,
        ...parsed,
        provider: parsed.provider ?? envBase.provider,
      },
      env,
    )
  } catch {
    return envBase
  }
}

export function saveLlmSettings(settings: LlmSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function isLlmConfigured(settings: LlmSettings): boolean {
  return settings.enabled && settings.apiKey.trim().length > 0 && settings.baseUrl.trim().length > 0
}
