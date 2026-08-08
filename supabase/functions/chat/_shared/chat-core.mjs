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
