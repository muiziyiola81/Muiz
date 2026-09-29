import React, { useState } from 'react';
import { Globe, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Source } from '../../types/chat';

interface SourcesCardProps {
  sources: Source[];
}

export const SourcesCard: React.FC<SourcesCardProps> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const displaySources = isExpanded ? sources : sources.slice(0, 3);

  return (
    <div className="mb-4 rounded-xl border border-[#262626] bg-[#111111] p-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-white font-medium">
          <Globe className="w-3.5 h-3.5 text-[#a3a3a3]" />
          <span>Web Search Sources ({sources.length})</span>
        </div>
        {sources.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[#858585] hover:text-white transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Show less' : `+${sources.length - 3} more`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {displaySources.map((source, index) => {
          let hostname = '';
          try {
            hostname = new URL(source.uri).hostname.replace('www.', '');
          } catch {
            hostname = 'web source';
          }

          return (
            <a
              key={index}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-2 rounded-lg bg-[#171717] hover:bg-[#222222] border border-[#262626] hover:border-[#404040] transition-colors group cursor-pointer"
            >
              <div className="mt-0.5 w-4 h-4 rounded-full bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0 text-[10px] text-white font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate group-hover:underline">
                  {source.title || hostname}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#737373]">
                  <span className="truncate">{hostname}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
