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

export function loadLlmSettings(): LlmSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_LLM_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<LlmSettings>
    return {
      ...DEFAULT_LLM_SETTINGS,
      ...parsed,
      baseUrl: parsed.baseUrl ?? PROVIDER_DEFAULTS[parsed.provider ?? 'openai'].baseUrl,
      model: parsed.model ?? PROVIDER_DEFAULTS[parsed.provider ?? 'openai'].model,
    }
  } catch {
    return { ...DEFAULT_LLM_SETTINGS }
  }
}

export function saveLlmSettings(settings: LlmSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function isLlmConfigured(settings: LlmSettings): boolean {
  return settings.enabled && settings.apiKey.trim().length > 0 && settings.baseUrl.trim().length > 0
}
