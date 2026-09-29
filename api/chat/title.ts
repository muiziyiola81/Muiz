import { getAiClient } from '../_lib/gemini';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { message } = body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Generate a concise, elegant 2 to 5 word title for a conversation starting with this user prompt: "${String(message).slice(0, 300)}". Respond with ONLY the title itself, without quotes or punctuation.`,
    });

    const title = response.text?.trim() || 'New Conversation';
    res.status(200).json({ title: title.replace(/^["']|["']$/g, '') });
  } catch (error: any) {
    console.error('Error in /api/chat/title:', error);
    res.status(200).json({ title: 'New Conversation' });
  }
}
