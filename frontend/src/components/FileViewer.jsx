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

export default function FileViewer({ content, filePath, diff }) {
    const [copied, setCopied] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState('');
    const [viewMode, setViewMode] = useState('raw'); // 'raw' or 'diff'

    useEffect(() => {
        if (diff && diff.files?.length > 0) {
            setViewMode('diff');
        } else {
            setViewMode('raw');
        }
    }, [diff]);

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
        if (viewMode === 'diff' && diff && diff.files?.length > 0) {
            const lang = getLanguageFromPath(filePath);
            const fileDiff = diff.files[0];
            let html = '';
            let lineNum = 0;

            fileDiff.hunks.forEach(hunk => {
                // Hunk header
                html += `<div class="bg-blue-900/20 text-blue-400/60 py-1 px-4 text-xs font-mono select-none border-y border-blue-900/30 my-1">${hunk.header}</div>`;

                hunk.changes.forEach(change => {
                    let lineHtml = '';
                    try {
                        if (lang && hljs.getLanguage(lang)) {
                            lineHtml = hljs.highlight(change.content, { language: lang }).value;
                        } else {
                            lineHtml = change.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        }
                    } catch (e) {
                        lineHtml = change.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    }

                    const bgClass = change.type === 'addition' ? 'bg-green-900/30 border-l-4 border-green-500' :
                        change.type === 'deletion' ? 'bg-red-900/30 border-l-4 border-red-500' :
                            'hover:bg-white/5';
                    const sign = change.type === 'addition' ? '+' : change.type === 'deletion' ? '-' : ' ';
                    const signColor = change.type === 'addition' ? 'text-green-400' : change.type === 'deletion' ? 'text-red-400' : 'text-gray-600';

                    html += `<div class="flex ${bgClass} transition-colors group">
                        <span class="select-none text-gray-600 text-right pr-2 w-10 flex-shrink-0 text-[10px] leading-6">${change.type === 'deletion' ? '-' : ++lineNum}</span>
                        <span class="select-none ${signColor} w-4 flex-shrink-0 text-center font-mono leading-6">${sign}</span>
                        <span class="flex-1 whitespace-pre-wrap font-mono py-0.5 leading-6 pl-2">${lineHtml || ' '}</span>
                    </div>`;
                });
            });
            setHighlightedCode(html);
        } else if (content) {
            const lang = getLanguageFromPath(filePath);
            let html = '';

            try {
                if (lang && hljs.getLanguage(lang)) {
                    html = hljs.highlight(content, { language: lang }).value;
                } else {
                    html = hljs.highlightAuto(content).value;
                }
            } catch (e) {
                html = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }

            const lines = html.split('\n');
            const linesHtml = lines.map((line, index) =>
                `<div class="flex hover:bg-white/5 transition-colors group">
                    <span class="select-none text-gray-600 text-right pr-4 w-12 flex-shrink-0 text-[10px] leading-6">${index + 1}</span>
                    <span class="flex-1 whitespace-pre-wrap font-mono py-0.5 leading-6">${line || ' '}</span>
                </div>`
            ).join('');

            setHighlightedCode(linesHtml);
        } else {
            setHighlightedCode('');
        }
    }, [content, filePath, diff, viewMode]);

    const detectedLang = getLanguageFromPath(filePath);

    return (
        <div className="bg-[#3d2d00] border border-white/10 rounded-xl h-full flex flex-col overflow-hidden shadow-2xl">
            {/* Status Bar */}
            <div className="px-4 py-2 bg-[#2a1f00] border-t border-white/5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    <div>
                        <h3 className="font-mono text-sm text-gray-300 truncate">
                            {filePath || 'No file selected'}
                        </h3>
                        {content && (
                            <p className="text-xs text-gray-500 mt-0.5">
                                {content.split('\n').length} lines • {detectedLang}
                            </p>
                        )}
                    </div>

                    {diff && diff.files?.length > 0 && (
                        <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5 ml-2">
                            <button
                                onClick={() => setViewMode('raw')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'raw' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Raw
                            </button>
                            <button
                                onClick={() => setViewMode('diff')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'diff' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Diff
                            </button>
                        </div>
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