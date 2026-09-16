import type { LlmSettings } from './llmSettings'

export class LlmClientError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'LlmClientError'
    this.status = status
  }
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * OpenAI-compatible chat completions (OpenAI, OpenRouter, Groq, LM Studio, etc.).
 */
export async function requestChatCompletion(
  settings: LlmSettings,
  messages: ChatMessage[],
): Promise<string> {
  const baseUrl = settings.baseUrl.replace(/\/$/, '')
  const url = `${baseUrl}/chat/completions`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages,
    }),
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json() as { error?: { message?: string } }
      detail = body.error?.message ?? detail
    } catch {
      // ignore parse errors
    }
    throw new LlmClientError(detail || `HTTP ${response.status}`, response.status)
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) throw new LlmClientError('Empty response from LLM')
  return content
}
