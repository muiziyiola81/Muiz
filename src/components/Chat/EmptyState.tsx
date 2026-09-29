import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Code2, Globe, FileText, Brain, PenTool } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string, options?: { webSearch?: boolean; thinkMode?: boolean }) => void;
  assistantName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  assistantName = 'GPT Hub',
}) => {
  const suggestedPrompts = [
    {
      title: 'Analyze & Refactor Code',
      description: 'Review a TypeScript snippet for performance and security',
      icon: Code2,
      prompt: 'Can you review this code architecture, identify performance bottlenecks, and recommend modern TypeScript improvements?',
    },
    {
      title: 'Search the Web',
      description: 'Get current real-time news, release notes, or research',
      icon: Globe,
      prompt: 'What are the most significant developments in generative AI and reasoning models this month? Provide key highlights and sources.',
      webSearch: true,
    },
    {
      title: 'Explain Complex Topic',
      description: 'Break down quantum computing or neural architectures',
      icon: Brain,
      prompt: 'Explain the mathematical intuition behind diffusion models versus transformer attention mechanisms in a structured, intuitive way.',
      thinkMode: true,
    },
    {
      title: 'Write a Compelling Pitch',
      description: 'Draft an executive summary or launch announcement',
      icon: PenTool,
      prompt: 'Help me draft an engaging, high-impact product launch announcement for a new developer tool.',
    },
    {
      title: 'Data & File Analysis',
      description: 'Extract insights, summarize findings, or build tables',
      icon: FileText,
      prompt: 'How should I structure and analyze a dataset with high dimensional customer behavior metrics to find actionable churn indicators?',
    },
    {
      title: 'Brainstorm Architecture',
      description: 'Design a resilient full-stack cloud system',
      icon: Sparkles,
      prompt: 'What are best practices for architecting an offline-first mobile web application with real-time server synchronization?',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full text-center select-none"
    >
      {/* Brand Icon Badge */}
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-[#171717] border border-[#2b2b2b] shadow-xl flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">
        {assistantName === 'GPT Hub' ? 'What can GPT Hub assist with today?' : `Chat with ${assistantName}`}
      </h1>
      <p className="text-sm text-[#a3a3a3] max-w-md mb-8">
        Stream reasoning, search live web citations, analyze multimodal documents, or write code with precision.
      </p>

      {/* Suggested prompts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full text-left">
        {suggestedPrompts.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.16 }}
              onClick={() => onSelectPrompt(item.prompt, { webSearch: item.webSearch, thinkMode: item.thinkMode })}
              className="p-3.5 rounded-xl bg-[#111111] hover:bg-[#171717] border border-[#262626] hover:border-[#404040] transition-colors cursor-pointer group flex flex-col justify-between min-h-[96px]"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="w-4 h-4 text-white group-hover:text-white transition-colors shrink-0" />
                  <span className="text-xs font-medium text-white">
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#858585] leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {item.webSearch && (
                  <span className="text-[10px] text-[#d4d4d4] bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2e2e2e]">
                    Live Web
                  </span>
                )}
                {item.thinkMode && (
                  <span className="text-[10px] text-[#d4d4d4] bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2e2e2e]">
                    Deep Think
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
