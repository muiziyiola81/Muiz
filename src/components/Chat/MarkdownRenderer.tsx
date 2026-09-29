import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code:', e);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#262626] bg-[#0a0a0a] text-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#171717] border-b border-[#262626] text-xs text-[#a3a3a3]">
        <span className="font-mono text-white font-medium">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span className="text-white">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#a3a3a3]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto font-mono text-xs text-[#e5e5e5] leading-relaxed select-text">
        <pre className="m-0 p-0 whitespace-pre">{code}</pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isStreaming }) => {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      const html = marked.parse(textBefore, { async: false }) as string;
      parts.push(
        <div
          key={`md-${lastIndex}`}
          className="gpt-markdown select-text"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    const language = match[1] || 'plaintext';
    const code = match[2];
    parts.push(
      <CodeBlock
        key={`code-${match.index}`}
        language={language}
        code={code.replace(/\n$/, '')}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText.trim() || parts.length === 0) {
    if (remainingText.includes('```')) {
      const splitByBackticks = remainingText.split('```');
      if (splitByBackticks[0].trim()) {
        const html = marked.parse(splitByBackticks[0], { async: false }) as string;
        parts.push(
          <div
            key={`md-rem-${lastIndex}`}
            className="gpt-markdown select-text"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
      if (splitByBackticks[1] !== undefined) {
        const lines = splitByBackticks[1].split('\n');
        const language = lines[0] || 'code';
        const code = lines.slice(1).join('\n');
        parts.push(
          <CodeBlock
            key={`code-partial-${lastIndex}`}
            language={language}
            code={code}
          />
        );
      }
    } else {
      const html = marked.parse(remainingText, { async: false }) as string;
      parts.push(
        <div
          key={`md-final-${lastIndex}`}
          className="gpt-markdown select-text"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
  }

  return (
    <div className="relative">
      {parts}
      {isStreaming && (
        <span
          className="inline-block w-2 h-4 ml-1 bg-white rounded-xs animate-pulse align-middle"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
