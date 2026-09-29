import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Streaming Chat API endpoint
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      systemInstruction,
      thinkMode = false,
      webSearch = false,
      model = 'gemini-3.8-flash',
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAiClient();

    // Prepare headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Format contents for @google/genai
    // Note: each message should have role 'user' | 'model' and parts
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

    // Configure tools if web search is enabled
    if (webSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Configure thinking level based on Think Mode
    if (thinkMode) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    } else {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.LOW,
      };
    }

    // Model selection with fallback support
    const targetModel = model || 'gemini-3.1-flash-lite';

    // Stream generation helper with fallback
    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents: formattedContents,
        config,
      });
    } catch (err: any) {
      // If quota exceeded or model unavailable, fallback to gemini-3.1-flash-lite
      if (err?.message?.includes('resource_exhausted') || err?.status === 429 || targetModel !== 'gemini-3.1-flash-lite') {
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
      // Check if client disconnected
      if (res.writableEnded) {
        break;
      }

      // Extract text content
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunkText })}\n\n`);
      }

      // Extract grounding metadata if present (from googleSearch)
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

    // Send final sources if any were discovered
    if (sourcesMap.size > 0) {
      const sources = Array.from(sourcesMap.values());
      res.write(`event: sources\ndata: ${JSON.stringify({ sources })}\n\n`);
    }

    // Send completion event
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
});

// Audio transcription endpoint (Speech to Text)
app.post('/api/chat/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
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
    res.json({ text: text.trim() });
  } catch (error: any) {
    console.error('Error in /api/chat/transcribe:', error);
    res.status(500).json({ error: error?.message || 'Failed to transcribe audio' });
  }
});

// Text to Speech endpoint (Audio output) - supports both /api/tts and /api/chat/tts
app.post(['/api/tts', '/api/chat/tts'], async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required.' });
    }

    // Limit text length to prevent timeouts
    const sanitizedText = text.slice(0, 1000);

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: sanitizedText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated by the model.' });
    }

    res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error in /api/chat/tts:', error);
    res.status(500).json({ error: error?.message || 'Failed to synthesize speech' });
  }
});

// Generate conversation title endpoint
app.post('/api/chat/title', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Generate a concise, elegant 2 to 5 word title for a conversation starting with this user prompt: "${message.slice(0, 300)}". Respond with ONLY the title itself, without quotes or punctuation.`,
    });

    const title = response.text?.trim() || 'New Conversation';
    res.json({ title: title.replace(/^["']|["']$/g, '') });
  } catch (error: any) {
    console.error('Error in /api/chat/title:', error);
    res.json({ title: 'New Conversation' });
  }
});

// Vite dev server mounting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`GPT Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
