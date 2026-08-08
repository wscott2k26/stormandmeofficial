export const MAX_CONTEXT_MESSAGES = 12;
export const MAX_CONTEXT_CHARS = 12000;

export function buildRecentContext(rows = [], options = {}) {
  const maxMessages = Number.isInteger(options.maxMessages) && options.maxMessages > 0
    ? options.maxMessages
    : MAX_CONTEXT_MESSAGES;
  const maxChars = Number.isInteger(options.maxChars) && options.maxChars > 0
    ? options.maxChars
    : MAX_CONTEXT_CHARS;

  const selectedNewestFirst = [];
  let usedChars = 0;

  for (const row of rows) {
    if (selectedNewestFirst.length >= maxMessages) break;
    if (!row || (row.role !== 'user' && row.role !== 'assistant')) continue;
    const content = typeof row.content === 'string' ? row.content : '';
    if (!content) continue;
    if (usedChars + content.length > maxChars) break;
    selectedNewestFirst.push({ role: row.role, content });
    usedChars += content.length;
  }

  return selectedNewestFirst.reverse();
}

const asInputText = (text) => [{ type: 'input_text', text }];

export function buildResponseInput(system, user, history = []) {
  const priorTurns = history
    .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string' && item.content.length > 0)
    .map(item => ({ role: item.role, content: asInputText(item.content) }));

  return [
    { role: 'system', content: asInputText(system) },
    ...priorTurns,
    { role: 'user', content: asInputText(user) },
  ];
}

export function sanitizeProviderFailure(error, stage, model) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const statusMatch = message.match(/(?:Responses API|Moderation) failed\s+(\d{3})/i);
  const status = statusMatch ? Number(statusMatch[1]) : null;
  let code = null;
  let type = null;

  const jsonStart = message.indexOf('{');
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(message.slice(jsonStart));
      code = parsed?.error?.code ?? null;
      type = parsed?.error?.type ?? null;
    } catch (_) {
      // Diagnostics intentionally ignore provider text that is not valid JSON.
    }
  }

  if (!code && message.includes('OPENAI_MODEL missing')) code = 'openai_model_missing';
  if (!code && message.includes('OPENAI_API_KEY missing')) code = 'openai_api_key_missing';
  if (!code && message.includes('Model output failed safety review')) code = 'output_flagged';

  return {
    stage: String(stage || 'unknown').slice(0, 40),
    status,
    code: code ? String(code).slice(0, 80) : null,
    type: type ? String(type).slice(0, 80) : null,
    model: String(model || 'unknown').slice(0, 80),
  };
}
