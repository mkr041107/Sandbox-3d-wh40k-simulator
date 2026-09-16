import { useEffect, useState } from 'react'
import {
  DEFAULT_LLM_SETTINGS,
  getProviderDefaults,
  isLlmConfigured,
  loadLlmSettings,
  saveLlmSettings,
  type LlmProviderPreset,
  type LlmSettings,
} from '../ai/llmSettings'
import { LlmClientError, requestChatCompletion } from '../ai/llmClient'

const PROVIDERS: { id: LlmProviderPreset; label: string; hint: string }[] = [
  { id: 'openai', label: 'OpenAI', hint: 'api.openai.com' },
  { id: 'openrouter', label: 'OpenRouter', hint: 'openrouter.ai' },
  { id: 'groq', label: 'Groq', hint: 'groq.com' },
  { id: 'custom', label: 'Custom / Local', hint: 'LM Studio, Ollama OpenAI shim, etc.' },
]

export function LlmSettingsPanel() {
  const [settings, setSettings] = useState<LlmSettings>(() => loadLlmSettings())
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  useEffect(() => {
    saveLlmSettings(settings)
  }, [settings])

  const update = (patch: Partial<LlmSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  const handleProviderChange = (provider: LlmProviderPreset) => {
    const defaults = getProviderDefaults(provider)
    setSettings((prev) => ({
      ...prev,
      provider,
      baseUrl: defaults.baseUrl,
      model: defaults.model,
    }))
    setTestStatus('idle')
  }

  const handleTestConnection = async () => {
    setTestStatus('testing')
    setTestMessage('')
    try {
      const content = await requestChatCompletion(settings, [
        { role: 'system', content: 'Reply with JSON: {"ok":true}' },
        { role: 'user', content: 'ping' },
      ])
      if (content.includes('ok')) {
        setTestStatus('ok')
        setTestMessage('Connection successful.')
      } else {
        setTestStatus('ok')
        setTestMessage('Got a response — LLM is reachable.')
      }
    } catch (err) {
      setTestStatus('error')
      setTestMessage(err instanceof LlmClientError ? err.message : 'Connection failed')
    }
  }

  const configured = isLlmConfigured(settings)

  return (
    <section className="setup-card llm-settings-card">
      <h3>LLM Opponent (optional)</h3>
      <p className="llm-settings-intro">
        Replace the built-in heuristic AI with a real language model. Your API key is stored only in
        <strong> localStorage</strong> in this browser — it is never sent anywhere except your chosen API provider.
      </p>

      <label className="llm-toggle">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        <span>Use LLM opponent instead of classic AI</span>
      </label>

      {settings.enabled && (
        <div className="llm-settings-fields">
          <div className="form-group">
            <label>Provider</label>
            <select
              value={settings.provider}
              onChange={(e) => handleProviderChange(e.target.value as LlmProviderPreset)}
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <span className="field-hint">{PROVIDERS.find((p) => p.id === settings.provider)?.hint}</span>
          </div>

          <div className="form-group">
            <label>API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => update({ apiKey: e.target.value })}
              placeholder="sk-..."
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Base URL</label>
            <input
              type="url"
              value={settings.baseUrl}
              onChange={(e) => update({ baseUrl: e.target.value })}
              placeholder={DEFAULT_LLM_SETTINGS.baseUrl}
            />
          </div>

          <div className="form-group">
            <label>Model</label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => update({ model: e.target.value })}
              placeholder="gpt-4o-mini"
            />
          </div>

          <div className="llm-settings-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={!settings.apiKey || testStatus === 'testing'}
            >
              {testStatus === 'testing' ? 'Testing…' : 'Test connection'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSettings({ ...DEFAULT_LLM_SETTINGS })
                setTestStatus('idle')
                setTestMessage('')
              }}
            >
              Clear saved settings
            </button>
          </div>

          {testMessage && (
            <p className={`llm-test-message ${testStatus === 'error' ? 'error' : 'ok'}`}>
              {testMessage}
            </p>
          )}

          {!configured && (
            <p className="warning">Enter an API key to enable the LLM opponent.</p>
          )}

          <p className="field-hint">
            Uses OpenAI-compatible <code>/chat/completions</code>. If the LLM fails mid-battle, the classic AI takes over for that phase.
          </p>
        </div>
      )}
    </section>
  )
}
