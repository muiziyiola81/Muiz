import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Camera,
  Mic,
  MicOff,
  Brain,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Attachment } from '../../types/chat';
import { AttachmentPreview } from './AttachmentPreview';
import { ToolsMenu } from './ToolsMenu';
import { CameraModal } from '../Modals/CameraModal';
import { ApiService } from '../../services/api';

interface ComposerProps {
  onSendMessage: (
    content: string,
    attachments: Attachment[],
    options: { thinkMode: boolean; webSearch: boolean }
  ) => void;
  isGenerating: boolean;
  onStopGenerating: () => void;
  thinkMode: boolean;
  onToggleThinkMode: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  onOpenImageViewer: (url: string) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  isGenerating,
  onStopGenerating,
  thinkMode,
  onToggleThinkMode,
  webSearch,
  onToggleWebSearch,
  onOpenImageViewer,
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Smooth auto-resize textarea as user types without jumpiness
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [content]);

  // Focus textarea when composer container is clicked
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't hijack clicks on buttons, inputs, links, or modals
    if (!target.closest('button') && !target.closest('input') && !target.closest('a')) {
      textareaRef.current?.focus();
    }
  };

  // Handle file attachment selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];

        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: isImg ? 'image' : 'file',
          mimeType: file.type || (isImg ? 'image/jpeg' : 'application/octet-stream'),
          size: file.size,
          url: result,
          base64Data,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCameraCapture = (attachment: Attachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  // Voice recording & transcription
  const handleToggleVoice = async () => {
    if (isRecordingVoice) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const startVoiceRecording = async () => {
    setVoiceError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setContent((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setVoiceError('Microphone permission was denied.');
          }
          stopVoiceRecording();
        };

        recognition.onend = () => {
          setIsRecordingVoice(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecordingVoice(true);
        return;
      } catch (err) {
        console.warn('SpeechRecognition failed, falling back to MediaRecorder:', err);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const transcribedText = await ApiService.transcribeAudio(audioBlob);
          if (transcribedText) {
            setContent((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
          }
        } catch {
          setVoiceError('Voice transcription failed.');
        }
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
    } catch (err: any) {
      console.warn('Microphone error:', err);
      setVoiceError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied.'
          : 'Microphone not available on this device.'
      );
      setIsRecordingVoice(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecordingVoice(false);
  };

  const handleSend = () => {
    if (isGenerating) {
      onStopGenerating();
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent && attachments.length === 0) return;

    onSendMessage(trimmedContent, attachments, { thinkMode, webSearch });
    setContent('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Desktop: Enter sends; Shift+Enter creates a new line
    // Mobile / small screens: Enter creates a new line normally so the user can compose multiline text comfortably
    if (e.key === 'Enter') {
      const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
      if (!isMobile && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const hasSendableInput = content.trim().length > 0 || attachments.length > 0;

  return (
    <div className="relative w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-5">
      {/* Voice Recording / Status Banner */}
      <AnimatePresence>
        {isRecordingVoice && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="mb-2 flex items-center justify-between px-4 py-2 rounded-xl bg-[#171717] border border-[#333333] text-white text-xs shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="font-medium text-[#e5e5e5]">Listening to voice... Speak naturally</span>
            </div>
            <button
              type="button"
              onClick={stopVoiceRecording}
              className="px-2.5 py-1 rounded-md bg-[#262626] hover:bg-[#333333] text-white font-medium text-[11px] cursor-pointer transition-colors"
            >
              Done Dictating
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {voiceError && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-[#1c1c1c] border border-[#333333] text-[#d4d4d4] text-xs flex items-center justify-between">
          <span>{voiceError}</span>
          <button
            onClick={() => setVoiceError(null)}
            className="text-[#a3a3a3] hover:text-white text-xs ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Composer Box */}
      <div
        onClick={handleContainerClick}
        className="relative rounded-2xl sm:rounded-3xl bg-[#111111] border border-[#262626] shadow-xl hover:border-[#383838] focus-within:border-[#525252] transition-colors cursor-text"
      >
        {/* Attachment Previews */}
        <AttachmentPreview
          attachments={attachments}
          onRemove={handleRemoveAttachment}
          onOpenImageViewer={onOpenImageViewer}
        />

        {/* Text Input Area */}
        <div className="px-4 pt-3.5 pb-1.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            disabled={isGenerating}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              thinkMode
                ? 'Ask GPT Hub a complex reasoning problem (Think Mode active)...'
                : 'Message GPT Hub...'
            }
            className="w-full bg-transparent text-[15px] text-white placeholder-[#737373] resize-none focus:outline-none max-h-48 leading-relaxed selection:bg-[#333333] disabled:opacity-60 cursor-text"
            style={{ minHeight: '24px' }}
          />
        </div>

        {/* Bottom Toolbar Controls */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          {/* Left Controls: Attachments, Camera, Mic, Tools, Think Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-[#a3a3a3]">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.doc,.docx,.csv,.xlsx,.json,.js,.ts,.tsx,.py,.html"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#262626] text-[#a3a3a3] hover:text-white transition-colors cursor-pointer"
              title="Attach files or images"
              aria-label="Attach files or images"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Camera button */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="p-2 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#262626] text-[#a3a3a3] hover:text-white transition-colors cursor-pointer"
              title="Take a photo"
              aria-label="Take a photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Mic button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isRecordingVoice
                  ? 'bg-[#262626] text-white border-[#525252] animate-pulse'
                  : 'bg-[#171717] hover:bg-[#222222] border-[#262626] text-[#a3a3a3] hover:text-white'
              }`}
              title={isRecordingVoice ? 'Stop voice input' : 'Voice input'}
              aria-label="Voice input"
            >
              {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="h-4 w-px bg-[#262626] mx-0.5" />

            {/* Web Search Quick Toggle */}
            <button
              type="button"
              onClick={onToggleWebSearch}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                webSearch
                  ? 'bg-[#222222] border border-[#404040] text-white shadow-sm'
                  : 'bg-[#171717] hover:bg-[#222222] border border-[#262626] text-[#a3a3a3] hover:text-white'
              }`}
              title="Search the web for fresh citations"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Think Mode Quick Toggle */}
            <button
              type="button"
              onClick={onToggleThinkMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                thinkMode
                  ? 'bg-[#222222] border border-[#404040] text-white shadow-sm'
                  : 'bg-[#171717] hover:bg-[#222222] border border-[#262626] text-[#a3a3a3] hover:text-white'
              }`}
              title="Toggle deep reasoning Think Mode"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{thinkMode ? 'Thinking' : 'Think'}</span>
            </button>

            {/* Tools Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isToolsOpen
                    ? 'bg-[#262626] text-white border-[#525252]'
                    : 'bg-[#171717] hover:bg-[#222222] border-[#262626] text-[#a3a3a3] hover:text-white'
                }`}
                title="Intelligence tools"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              <ToolsMenu
                isOpen={isToolsOpen}
                onClose={() => setIsToolsOpen(false)}
                webSearch={webSearch}
                onToggleWebSearch={onToggleWebSearch}
                thinkMode={thinkMode}
                onToggleThinkMode={onToggleThinkMode}
              />
            </div>
          </div>

          {/* Right Control: Send / Stop Generating Button */}
          <div>
            {isGenerating ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onStopGenerating}
                className="w-8 h-8 rounded-full bg-white text-black hover:bg-[#e5e5e5] flex items-center justify-center transition-all shadow-md cursor-pointer"
                title="Stop generation"
                aria-label="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-black" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: hasSendableInput ? 0.94 : 1 }}
                disabled={!hasSendableInput}
                onClick={handleSend}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
                  hasSendableInput
                    ? 'bg-white hover:bg-[#e5e5e5] text-black cursor-pointer'
                    : 'bg-[#171717] border border-[#262626] text-[#525252] cursor-not-allowed'
                }`}
                title="Send message"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
