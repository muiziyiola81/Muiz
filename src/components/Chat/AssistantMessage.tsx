import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Brain,
  AlertCircle,
  Pause,
} from 'lucide-react';
import { Message } from '../../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SourcesCard } from './SourcesCard';
import { ApiService } from '../../services/api';

interface AssistantMessageProps {
  message: Message;
  isStreaming?: boolean;
  voiceName?: string;
  onRegenerate: () => void;
  onShare: () => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  isStreaming = false,
  voiceName = 'Kore',
  onRegenerate,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy message:', e);
    }
  };

  const handleToggleVoice = async () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setIsPlayingAudio(true);
      return;
    }

    setIsAudioLoading(true);
    setAudioError(null);

    try {
      const audioUrl = await ApiService.generateSpeech(message.content, voiceName);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
        fallbackBrowserSpeech();
      };

      await audio.play();
      setIsPlayingAudio(true);
    } catch {
      fallbackBrowserSpeech();
    } finally {
      setIsAudioLoading(false);
    }
  };

  const fallbackBrowserSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content.slice(0, 800));
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    } else {
      setAudioError('Text-to-speech is currently unavailable.');
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  return (
    <div className="flex gap-3.5 mb-6 group max-w-full">
      {/* Brand Icon */}
      <div className="shrink-0 w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center border border-[#2b2b2b] shadow-sm mt-0.5 text-white">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      {/* Response content */}
      <div className="flex-1 min-w-0">
        {/* Thinking Indicator */}
        {message.isThinking && (
          <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] text-xs text-[#e5e5e5] w-fit">
            <Brain className="w-3.5 h-3.5 animate-pulse text-white" />
            <span className="font-medium">Thinking deeply...</span>
          </div>
        )}

        {/* Thought time badge */}
        {!message.isThinking && message.thinkingTime && (
          <div className="flex items-center gap-1.5 mb-2.5 text-[11px] text-[#737373]">
            <Brain className="w-3 h-3 text-[#a3a3a3]" />
            <span>Thought for {message.thinkingTime}s</span>
          </div>
        )}

        {/* Grounded Web Sources */}
        {message.sources && message.sources.length > 0 && (
          <SourcesCard sources={message.sources} />
        )}

        {/* Error state */}
        {message.error ? (
          <div className="p-3.5 rounded-xl bg-[#171717] border border-[#404040] text-white text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#a3a3a3]" />
            <div className="flex-1">
              <p className="font-medium text-white">Response Generation Notice</p>
              <p className="text-xs text-[#a3a3a3] mt-0.5">{message.error}</p>
              <button
                onClick={onRegenerate}
                className="mt-2 text-xs text-white hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[14.5px] leading-relaxed select-text text-white">
            <MarkdownRenderer
              content={message.content}
              isStreaming={isStreaming && message.isStreaming}
            />
          </div>
        )}

        {/* Action toolbar */}
        {!message.isThinking && !isStreaming && message.content && (
          <div className="flex items-center gap-1 mt-3 pt-2 text-[#737373] opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-[#1c1c1c] hover:text-white transition-colors cursor-pointer"
              title="Copy message"
              aria-label="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onRegenerate}
              className="p-1.5 rounded-lg hover:bg-[#1c1c1c] hover:text-white transition-colors cursor-pointer"
              title="Regenerate response"
              aria-label="Regenerate response"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToggleVoice}
              disabled={isAudioLoading}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPlayingAudio
                  ? 'bg-[#262626] text-white'
                  : 'hover:bg-[#1c1c1c] hover:text-white'
              }`}
              title={isPlayingAudio ? 'Pause voice' : 'Listen to response'}
              aria-label="Listen to response"
            >
              {isAudioLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : isPlayingAudio ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {isPlayingAudio && (
              <button
                onClick={handleStopAudio}
                className="p-1.5 rounded-lg hover:bg-[#1c1c1c] hover:text-white transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Stop voice"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onShare}
              className="p-1.5 rounded-lg hover:bg-[#1c1c1c] hover:text-white transition-colors cursor-pointer"
              title="Share response"
              aria-label="Share response"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {audioError && (
              <span className="text-[11px] text-[#a3a3a3] ml-2">{audioError}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
