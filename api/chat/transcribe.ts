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
    const { audioData, mimeType = 'audio/webm' } = body;

    if (!audioData) {
      return res.status(400).json({ error: 'audioData base64 is required.' });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioData,
            },
          },
          {
            text: 'Transcribe this speech accurately in its original language. Output only the verbatim transcription without commentary.',
          },
        ],
      },
    });

    const text = response.text || '';
    res.status(200).json({ text: text.trim() });
  } catch (error: any) {
    console.error('Error in /api/chat/transcribe:', error);
    res.status(500).json({ error: error?.message || 'Failed to transcribe audio' });
  }
}
