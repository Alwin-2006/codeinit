import { useState, useEffect } from 'react';
import { Copy, Check, File } from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/atom-one-dark.css';

// Configure highlight.js common languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);

export default function FileViewer({ content, filePath }) {
    const [copied, setCopied] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState('');

    const handleCopy = async () => {
        if (content) {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getLanguageFromPath = (path) => {
        if (!path) return 'plaintext';
        const ext = path.split('.').pop().toLowerCase();
        const langMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'php': 'php',
            'html': 'xml',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'md': 'markdown',
            'sh': 'bash',
            'yml': 'yaml',
            'yaml': 'yaml',
        };
        return langMap[ext] || 'plaintext';
    };

    useEffect(() => {
        if (!content) {
            setHighlightedCode('');
            return;
        }

        const lang = getLanguageFromPath(filePath);
        let html = '';

        try {
            if (lang && hljs.getLanguage(lang)) {
                html = hljs.highlight(content, { language: lang }).value;
            } else {
                html = hljs.highlightAuto(content).value;
            }
        } catch (e) {
            console.warn('Highlight info lookup failed, falling back to plaintext', e);
            // Fallback for simple escaping if highlighting fails
            html = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        // Add line numbers
        const lines = html.split('\n');
        const linesHtml = lines.map((line, index) =>
            `<div class="flex hover:bg-white/5">
        <span class="select-none text-gray-600 text-right pr-4 w-12 flex-shrink-0">${index + 1}</span>
        <span class="flex-1 whitespace-pre-wrap font-mono">${line || ' '}</span>
      </div>`
        ).join('');

        setHighlightedCode(linesHtml);
    }, [content, filePath]);

    const detectedLang = getLanguageFromPath(filePath);

    return (
        <div className="bg-[#3d2d00] border border-white/10 rounded-xl h-full flex flex-col overflow-hidden shadow-2xl">
            {/* Status Bar */}
            <div className="px-4 py-1 bg-[#2a1f00] border-t border-white/5 flex items-center justify-between flex-shrink-0">
                <div className="min-w-0">
                    <h3 className="font-mono text-sm text-gray-300 truncate">
                        {filePath || 'No file selected'}
                    </h3>
                    {content && (
                        <p className="text-xs text-gray-500 mt-1">
                            {content.split('\n').length} lines • {detectedLang}
                        </p>
                    )}
                </div>
                {content && (
                    <button
                        onClick={handleCopy}
                        className="p-2 glass-dark hover:bg-white/10 rounded-lg transition-all flex-shrink-0 ml-4"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto scrollbar-thin bg-black">
                {content ? (
                    <div className="p-4 text-sm leading-relaxed">
                        <code
                            dangerouslySetInnerHTML={{ __html: highlightedCode }}
                            className="block"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-600 bg-black">
                        <div className="text-center">
                            <File className="mx-auto mb-4 opacity-20" size={48} />
                            <p>Select a file to view its contents</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}