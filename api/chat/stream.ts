import { ThinkingLevel } from '@google/genai';
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
    const {
      messages,
      systemInstruction,
      thinkMode = false,
      webSearch = false,
      model = 'gemini-3.1-flash-lite',
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAiClient();

    // Prepare headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    // Format contents for @google/genai
    const formattedContents = messages.map((m: any) => {
      const parts: any[] = [];
      if (m.attachments && Array.isArray(m.attachments)) {
        for (const att of m.attachments) {
          if (att.base64Data && att.mimeType) {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.base64Data,
              },
            });
          }
        }
      }
      if (m.content) {
        parts.push({ text: m.content });
      } else if (parts.length === 0) {
        parts.push({ text: ' ' });
      }

      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const config: any = {};

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (webSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    if (thinkMode) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    } else {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.LOW,
      };
    }

    const targetModel = model || 'gemini-3.1-flash-lite';
    let responseStream;

    try {
      responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents: formattedContents,
        config,
      });
    } catch (err: any) {
      if (
        err?.message?.includes('resource_exhausted') ||
        err?.status === 429 ||
        targetModel !== 'gemini-3.1-flash-lite'
      ) {
        console.warn(`Primary model ${targetModel} unavailable, falling back to gemini-3.1-flash-lite:`, err?.message);
        responseStream = await ai.models.generateContentStream({
          model: 'gemini-3.1-flash-lite',
          contents: formattedContents,
          config,
        });
      } else {
        throw err;
      }
    }

    let fullText = '';
    const sourcesMap = new Map<string, { uri: string; title: string }>();

    for await (const chunk of responseStream) {
      if (res.writableEnded || res.closed) {
        break;
      }

      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunkText })}\n\n`);
      }

      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        for (const gc of groundingMetadata.groundingChunks) {
          if (gc.web?.uri) {
            const uri = gc.web.uri;
            const title = gc.web.title || new URL(uri).hostname;
            sourcesMap.set(uri, { uri, title });
          }
        }
      }
    }

    if (sourcesMap.size > 0) {
      const sources = Array.from(sourcesMap.values());
      res.write(`event: sources\ndata: ${JSON.stringify({ sources })}\n\n`);
    }

    res.write(`event: done\ndata: ${JSON.stringify({ fullText })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error in /api/chat/stream:', error);
    const errorMessage = error?.message || 'An error occurred during response generation.';
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }
}
