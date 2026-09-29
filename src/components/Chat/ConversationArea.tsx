import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Message, Conversation } from '../../types/chat';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { EmptyState } from './EmptyState';

interface ConversationAreaProps {
  conversation: Conversation | null;
  isGenerating: boolean;
  voiceName: string;
  onSelectPrompt: (prompt: string, options?: { webSearch?: boolean; thinkMode?: boolean }) => void;
  onRegenerate: () => void;
  onEditAndResend: (messageId: string, newContent: string) => void;
  onOpenImageViewer: (url: string) => void;
  onOpenShareModal: () => void;
  assistantName?: string;
}

export const ConversationArea: React.FC<ConversationAreaProps> = ({
  conversation,
  isGenerating,
  voiceName,
  onSelectPrompt,
  onRegenerate,
  onEditAndResend,
  onOpenImageViewer,
  onOpenShareModal,
  assistantName,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isAutoScrollEnabled = useRef(true);

  const messages = conversation?.messages || [];

  // Scroll to bottom when new messages arrive or during streaming
  useEffect(() => {
    if (isAutoScrollEnabled.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  // Handle scroll events to detect if user scrolled away from bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceToBottom > 120) {
      setShowScrollBottom(true);
      isAutoScrollEnabled.current = false;
    } else {
      setShowScrollBottom(false);
      isAutoScrollEnabled.current = true;
    }
  };

  const scrollToBottom = () => {
    isAutoScrollEnabled.current = true;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  if (!conversation || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <EmptyState onSelectPrompt={onSelectPrompt} assistantName={assistantName} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-4 py-6 scroll-smooth relative"
    >
      <div className="max-w-3xl mx-auto w-full">
        {messages.map((message: Message, index: number) => {
          const isLastMessage = index === messages.length - 1;
          const isModelStreaming = isLastMessage && isGenerating && message.role === 'assistant';

          if (message.role === 'user') {
            return (
              <UserMessage
                key={message.id}
                message={message}
                onEditAndResend={onEditAndResend}
                onOpenImageViewer={onOpenImageViewer}
              />
            );
          }

          return (
            <AssistantMessage
              key={message.id}
              message={message}
              isStreaming={isModelStreaming}
              voiceName={voiceName}
              onRegenerate={onRegenerate}
              onShare={onOpenShareModal}
            />
          );
        })}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 sm:right-10 z-20 w-9 h-9 rounded-full bg-[#171717] hover:bg-[#222222] border border-[#333333] text-white shadow-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105"
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
};
