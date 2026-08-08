import { buildResponseInput } from './chat-core.mjs';

const key = () => {
  const value = Deno.env.get('OPENAI_API_KEY');
  if (!value) throw new Error('OPENAI_API_KEY missing');
  return value;
};

export async function moderate(input: string) {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'omni-moderation-latest', input }),
  });
  if (!response.ok) throw new Error(`Moderation failed ${response.status}`);
  return await response.json();
}

export async function respond(
  system: string,
  user: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
) {
  const model = Deno.env.get('OPENAI_MODEL');
  if (!model) throw new Error('OPENAI_MODEL missing');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 900,
      input: buildResponseInput(system, user, history),
    }),
  });

  if (!response.ok) {
    throw new Error(`Responses API failed ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    text:
      data.output_text ??
      data.output?.flatMap((item: any) => item.content ?? []).find((item: any) => item.type === 'output_text')?.text ??
      'I could not form a response safely.',
  };
}
