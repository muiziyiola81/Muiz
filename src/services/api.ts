import { Message, Source } from '../types/chat';

export interface StreamChatParams {
  messages: Message[];
  systemInstruction?: string;
  thinkMode?: boolean;
  webSearch?: boolean;
  model?: string;
  signal?: AbortSignal;
  onChunk: (text: string) => void;
  onSources?: (sources: Source[]) => void;
  onError: (error: string) => void;
  onDone: (fullText: string) => void;
}

export const ApiService = {
  async streamChatMessage({
    messages,
    systemInstruction,
    thinkMode = false,
    webSearch = false,
    model = 'gemini-3.8-flash',
    signal,
    onChunk,
    onSources,
    onError,
    onDone,
  }: StreamChatParams): Promise<void> {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          systemInstruction,
          thinkMode,
          webSearch,
          model,
        }),
        signal,
      });

      if (!response.ok) {
        let errMessage = 'Failed to generate response.';
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch {
          errMessage = `Server error: ${response.statusText} (${response.status})`;
        }
        onError(errMessage);
        return;
      }

      if (!response.body) {
        onError('Streaming is not supported by the response.');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'chunk';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.replace('event:', '').trim();
            continue;
          }

          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.replace('data:', '').trim();
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'chunk' && data.text) {
                accumulatedText += data.text;
                onChunk(data.text);
              } else if (currentEvent === 'sources' && data.sources) {
                if (onSources) {
                  onSources(data.sources);
                }
              } else if (currentEvent === 'done') {
                onDone(data.fullText || accumulatedText);
                return;
              } else if (currentEvent === 'error') {
                onError(data.error || 'Stream error occurred.');
                return;
              }
            } catch (err) {
              console.warn('Failed to parse SSE JSON line:', dataStr, err);
            }
          }
        }
      }

      onDone(accumulatedText);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User aborted the generation, not an application error
        return;
      }
      console.error('Error during streaming chat:', err);
      onError(err.message || 'Network connection failed.');
    }
  },

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64 = res.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const audioData = await base64Promise;

      const response = await fetch('/api/chat/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData,
          mimeType: audioBlob.type || 'audio/webm',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Audio transcription failed');
      }

      const data = await response.json();
      return data.text || '';
    } catch (e: any) {
      console.error('Error transcribing audio:', e);
      throw e;
    }
  },

  async generateSpeech(text: string, voice = 'Kore'): Promise<string> {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'TTS generation failed');
      }

      const data = await response.json();
      if (!data.audio) {
        throw new Error('No audio returned');
      }
      return `data:${data.mimeType || 'audio/wav'};base64,${data.audio}`;
    } catch (e: any) {
      console.error('Error generating speech:', e);
      throw e;
    }
  },

  async generateChatTitle(firstMessage: string): Promise<string> {
    try {
      const response = await fetch('/api/chat/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: firstMessage }),
      });
      if (!response.ok) return 'New Conversation';
      const data = await response.json();
      return data.title || 'New Conversation';
    } catch {
      return 'New Conversation';
    }
  },
};
