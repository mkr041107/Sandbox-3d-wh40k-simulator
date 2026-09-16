export type LlmProviderPreset = 'openai' | 'openrouter' | 'groq' | 'custom'

/** `env` = "Custom" profile loaded from `.env`; `manual` = enter provider/key in the UI. */
export type LlmConfigSource = 'manual' | 'env'

export interface LlmSettings {
  configSource: LlmConfigSource
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
  configSource: 'manual',
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

/** Known presets or any other value → treat as a custom third-party API. */
function resolveEnvProvider(value: string | undefined): LlmProviderPreset {
  return parseEnvProvider(value) ?? (value?.trim() ? 'custom' : 'openai')
}

/** Values from `.env` only — used by the "Custom" config profile. */
export function getEnvLlmSettings(): Partial<LlmSettings> {
  const provider = resolveEnvProvider(import.meta.env.VITE_LLM_PROVIDER)
  const out: Partial<LlmSettings> = {}

  if (import.meta.env.VITE_LLM_ENABLED === 'true') out.enabled = true
  if (import.meta.env.VITE_LLM_ENABLED === 'false') out.enabled = false
  out.provider = provider
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

/** True when `.env` has at least an API key for the Custom profile. */
export function isEnvConfigReady(): boolean {
  return Boolean(getEnvLlmSettings().apiKey?.trim())
}

/** Optional `.env` fields still using built-in fallbacks — shown in the UI. */
export function getEnvConfigGaps(): string[] {
  const gaps: string[] = []
  if (!import.meta.env.VITE_LLM_BASE_URL?.trim()) gaps.push('VITE_LLM_BASE_URL')
  if (!import.meta.env.VITE_LLM_MODEL?.trim()) gaps.push('VITE_LLM_MODEL')
  return gaps
}

function mergeWithEnvDefaults(settings: LlmSettings, env: Partial<LlmSettings>): LlmSettings {
  const provider = settings.provider ?? env.provider ?? DEFAULT_LLM_SETTINGS.provider
  const providerDefaults = PROVIDER_DEFAULTS[provider]

  return {
    configSource: 'env',
    enabled: env.enabled ?? settings.enabled ?? DEFAULT_LLM_SETTINGS.enabled,
    provider,
    apiKey: env.apiKey || settings.apiKey || '',
    baseUrl: env.baseUrl || settings.baseUrl || providerDefaults.baseUrl,
    model: env.model || settings.model || providerDefaults.model,
  }
}

/** Full "Custom" profile from `.env` (no localStorage). */
export function getEnvProfileSettings(): LlmSettings {
  return mergeWithEnvDefaults(DEFAULT_LLM_SETTINGS, getEnvLlmSettings())
}

function getManualBaseline(): LlmSettings {
  return { ...DEFAULT_LLM_SETTINGS, configSource: 'manual' }
}

interface StoredLlmPrefs extends Partial<LlmSettings> {
  configSource?: LlmConfigSource
}

function loadLocalOverrides(): StoredLlmPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as StoredLlmPrefs
    if (parsed.apiKey !== undefined && !String(parsed.apiKey).trim()) {
      delete parsed.apiKey
    }
    return parsed
  } catch {
    return {}
  }
}

export function loadLlmSettings(): LlmSettings {
  const overrides = loadLocalOverrides()
  const configSource = overrides.configSource ?? 'manual'

  if (configSource === 'env') {
    const env = getEnvProfileSettings()
    return {
      configSource: 'env',
      enabled: overrides.enabled ?? env.enabled,
      provider: env.provider,
      apiKey: env.apiKey,
      baseUrl: env.baseUrl,
      model: env.model,
    }
  }

  const manual = getManualBaseline()
  const provider = overrides.provider ?? manual.provider
  const providerDefaults = PROVIDER_DEFAULTS[provider]

  return {
    configSource: 'manual',
    enabled: overrides.enabled ?? manual.enabled,
    provider,
    apiKey: overrides.apiKey?.trim() || manual.apiKey,
    baseUrl: overrides.baseUrl?.trim() || manual.baseUrl || providerDefaults.baseUrl,
    model: overrides.model?.trim() || manual.model || providerDefaults.model,
  }
}

/** Apply the selected config profile (manual vs Custom `.env`). */
export function resolveLlmSettings(settings: LlmSettings): LlmSettings {
  if (settings.configSource === 'env') {
    const env = getEnvProfileSettings()
    return {
      configSource: 'env',
      enabled: settings.enabled,
      provider: env.provider,
      apiKey: env.apiKey,
      baseUrl: env.baseUrl,
      model: env.model,
    }
  }
  return settings
}

export function saveLlmSettings(settings: LlmSettings): void {
  const overrides: StoredLlmPrefs = { configSource: settings.configSource }

  if (settings.configSource === 'env') {
    const env = getEnvProfileSettings()
    if (settings.enabled !== env.enabled) overrides.enabled = settings.enabled
  } else {
    const manual = getManualBaseline()
    if (settings.enabled !== manual.enabled) overrides.enabled = settings.enabled
    if (settings.provider !== manual.provider) overrides.provider = settings.provider
    if (settings.apiKey.trim() && settings.apiKey !== manual.apiKey) {
      overrides.apiKey = settings.apiKey
    }
    if (settings.baseUrl.trim() && settings.baseUrl !== manual.baseUrl) {
      overrides.baseUrl = settings.baseUrl
    }
    if (settings.model.trim() && settings.model !== manual.model) {
      overrides.model = settings.model
    }
  }

  const { configSource, ...rest } = overrides
  const hasOverrides = Object.keys(rest).length > 0

  if (!hasOverrides && configSource === 'manual') {
    localStorage.removeItem(STORAGE_KEY)
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

export function clearLlmSettings(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function isLlmConfigured(settings: LlmSettings): boolean {
  const active = resolveLlmSettings(settings)
  return active.enabled && active.apiKey.trim().length > 0 && active.baseUrl.trim().length > 0
}

export function maskApiKey(key: string): string {
  if (!key) return '(not set)'
  if (key.length <= 8) return '••••••••'
  return `${key.slice(0, 4)}••••${key.slice(-4)}`
}
