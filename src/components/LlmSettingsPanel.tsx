import { useState } from 'react'
import {
  clearLlmSettings,
  getEnvConfigGaps,
  getEnvProfileSettings,
  getProviderDefaults,
  isEnvConfigReady,
  isLlmConfigured,
  loadLlmSettings,
  maskApiKey,
  resolveLlmSettings,
  saveLlmSettings,
  type LlmConfigSource,
  type LlmProviderPreset,
  type LlmSettings,
} from '../ai/llmSettings'
import { LlmClientError, requestChatCompletion } from '../ai/llmClient'

const MANUAL_PROVIDERS: { id: LlmProviderPreset; label: string; hint: string }[] = [
  { id: 'openai', label: 'OpenAI', hint: 'api.openai.com' },
  { id: 'openrouter', label: 'OpenRouter', hint: 'openrouter.ai' },
  { id: 'groq', label: 'Groq', hint: 'groq.com' },
  { id: 'custom', label: 'Local server', hint: 'LM Studio, Ollama OpenAI shim, etc.' },
]

const CONFIG_SOURCES: { id: LlmConfigSource; label: string; description: string }[] = [
  {
    id: 'manual',
    label: 'Manual',
    description: 'Pick a provider and enter your API key in the browser',
  },
  {
    id: 'env',
    label: 'Custom',
    description: 'Load API key, URL, and model from your .env file',
  },
]

export function LlmSettingsPanel() {
  const [settings, setSettings] = useState<LlmSettings>(() => loadLlmSettings())
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  const activeSettings = resolveLlmSettings(settings)
  const envReady = isEnvConfigReady()
  const envGaps = getEnvConfigGaps()
  const envProfile = getEnvProfileSettings()

  const commitSettings = (next: LlmSettings) => {
    setSettings(next)
    saveLlmSettings(next)
  }

  const update = (patch: Partial<LlmSettings>) => {
    commitSettings({ ...settings, ...patch })
  }

  const handleConfigSourceChange = (configSource: LlmConfigSource) => {
    if (configSource === 'env' && !envReady) return

    if (configSource === 'env') {
      commitSettings({
        configSource: 'env',
        enabled: settings.enabled,
        provider: envProfile.provider,
        apiKey: envProfile.apiKey,
        baseUrl: envProfile.baseUrl,
        model: envProfile.model,
      })
    } else {
      commitSettings({
        ...settings,
        configSource: 'manual',
      })
    }
    setTestStatus('idle')
    setTestMessage('')
  }

  const handleProviderChange = (provider: LlmProviderPreset) => {
    const defaults = getProviderDefaults(provider)
    commitSettings({
      ...settings,
      configSource: 'manual',
      provider,
      baseUrl: defaults.baseUrl,
      model: defaults.model,
    })
    setTestStatus('idle')
  }

  const handleTestConnection = async () => {
    setTestStatus('testing')
    setTestMessage('')
    const toTest = resolveLlmSettings(settings)
    try {
      const content = await requestChatCompletion(toTest, [
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
        Replace the built-in heuristic AI with a real language model. Choose <strong>Manual</strong> to
        enter keys in the browser, or <strong>Custom</strong> to load a profile from your local{' '}
        <code>.env</code> file (see <code>.env.example</code>). Restart <code>npm run dev</code> after
        editing <code>.env</code>.
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
            <label>Configuration</label>
            <div className="llm-config-grid">
              {CONFIG_SOURCES.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={`llm-config-btn ${settings.configSource === source.id ? 'active' : ''}`}
                  disabled={source.id === 'env' && !envReady}
                  onClick={() => handleConfigSourceChange(source.id)}
                >
                  <strong>{source.label}</strong>
                  <span>{source.description}</span>
                </button>
              ))}
            </div>
            {!envReady && (
              <p className="warning">
                Custom profile unavailable — set <code>VITE_LLM_API_KEY</code> in <code>.env</code> and restart the dev server.
              </p>
            )}
          </div>

          {settings.configSource === 'env' ? (
            <div className="llm-env-profile">
              <h4>Custom profile (.env)</h4>
              <dl className="llm-env-details">
                <div>
                  <dt>API key</dt>
                  <dd>{maskApiKey(envProfile.apiKey)}</dd>
                </div>
                <div>
                  <dt>Base URL</dt>
                  <dd><code>{envProfile.baseUrl}</code></dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd><code>{envProfile.model}</code></dd>
                </div>
                <div>
                  <dt>Provider hint</dt>
                  <dd>{envProfile.provider}</dd>
                </div>
              </dl>
              {envGaps.length > 0 && (
                <p className="llm-env-banner">
                  Using built-in defaults for {envGaps.join(' and ')} — uncomment those lines in{' '}
                  <code>.env</code> (e.g. nano-gpt URL + model) for best results.
                </p>
              )}
              <p className="field-hint">
                Values are read from <code>.env</code> at startup and are not stored in localStorage.
              </p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Provider</label>
                <select
                  value={settings.provider}
                  onChange={(e) => handleProviderChange(e.target.value as LlmProviderPreset)}
                >
                  {MANUAL_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <span className="field-hint">
                  {MANUAL_PROVIDERS.find((p) => p.id === settings.provider)?.hint}
                </span>
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
                  placeholder={getProviderDefaults(settings.provider).baseUrl}
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
            </>
          )}

          <div className="llm-settings-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={!activeSettings.apiKey || testStatus === 'testing'}
            >
              {testStatus === 'testing' ? 'Testing…' : 'Test connection'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                clearLlmSettings()
                setSettings(loadLlmSettings())
                setTestStatus('idle')
                setTestMessage('')
              }}
            >
              Clear saved preferences
            </button>
          </div>

          {testMessage && (
            <p className={`llm-test-message ${testStatus === 'error' ? 'error' : 'ok'}`}>
              {testMessage}
            </p>
          )}

          {!configured && (
            <p className="warning">
              {settings.configSource === 'env'
                ? 'Custom profile is incomplete — check your .env file.'
                : 'Enter an API key to enable the LLM opponent.'}
            </p>
          )}

          <p className="field-hint">
            Uses OpenAI-compatible <code>/chat/completions</code>. If the LLM fails mid-battle, the classic AI takes over for that phase.
          </p>
        </div>
      )}
    </section>
  )
}
