import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import FileTree from './FileTree';
import FileViewer from './FileViewer';
import Timeline from './Timeline';
import { GitBranch, FolderGit2, Search, Settings, Loader2, Info } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_COMMITS = [
    {
        hash: 'a1b2c3d4e5f6g7h8i9j0',
        shortHash: 'a1b2c3d',
        message: 'Initial commit: Project setup',
        author: 'Alwin',
        timestamp: new Date('2026-02-01T10:00:00Z').getTime(),
        stats: { filesChanged: 3 }
    },
    {
        hash: 'b1c2d3e4f5g6h7i8j9k0',
        shortHash: 'b1c2d3e',
        message: 'Add FileExplorer component and basic styling',
        author: 'Alwin',
        timestamp: new Date('2026-02-03T14:30:00Z').getTime(),
        stats: { filesChanged: 5 }
    },
    {
        hash: 'c1d2e3f4g5h6i7j8k9l0',
        shortHash: 'c1d2e3f',
        message: 'Implement Git Time Machine playback logic',
        author: 'Alwin',
        timestamp: new Date('2026-02-07T12:00:00Z').getTime(),
        stats: { filesChanged: 2 }
    }
];

const MOCK_TREES = {
    'a1b2c3d4e5f6g7h8i9j0': {
        name: 'root',
        type: 'directory',
        path: '.',
        children: [
            {
                name: 'src', type: 'directory', path: 'src', children: [
                    { name: 'App.jsx', type: 'file', path: 'src/App.jsx' },
                    { name: 'index.css', type: 'file', path: 'src/index.css' }
                ]
            },
            { name: 'package.json', type: 'file', path: 'package.json' }
        ]
    },
    'b1c2d3e4f5g6h7i8j9k0': {
        name: 'root',
        type: 'directory',
        path: '.',
        children: [
            {
                name: 'src', type: 'directory', path: 'src', children: [
                    {
                        name: 'components', type: 'directory', path: 'src/components', children: [
                            { name: 'FileTree.jsx', type: 'file', path: 'src/components/FileTree.jsx' },
                            { name: 'Repo.jsx', type: 'file', path: 'src/components/Repo.jsx' }
                        ]
                    },
                    { name: 'App.jsx', type: 'file', path: 'src/App.jsx' },
                    { name: 'index.css', type: 'file', path: 'src/index.css' }
                ]
            },
            { name: 'package.json', type: 'file', path: 'package.json' }
        ]
    },
    'c1d2e3f4g5h6i7j8k9l0': {
        name: 'root',
        type: 'directory',
        path: '.',
        children: [
            {
                name: 'src', type: 'directory', path: 'src', children: [
                    {
                        name: 'components', type: 'directory', path: 'src/components', children: [
                            { name: 'FileTree.jsx', type: 'file', path: 'src/components/FileTree.jsx' },
                            { name: 'FileViewer.jsx', type: 'file', path: 'src/components/FileViewer.jsx' },
                            { name: 'Timeline.jsx', type: 'file', path: 'src/components/Timeline.jsx' },
                            { name: 'Repo.jsx', type: 'file', path: 'src/components/Repo.jsx' }
                        ]
                    },
                    { name: 'App.jsx', type: 'file', path: 'src/App.jsx' },
                    { name: 'index.css', type: 'file', path: 'src/index.css' }
                ]
            },
            { name: 'package.json', type: 'file', path: 'package.json' }
        ]
    }
};

const MOCK_FILES = {
    'src/App.jsx': {
        'a1b2c3d4e5f6g7h8i9j0': 'import React from "react";\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;',
        'b1c2d3e4f5g6h7i8j9k0': 'import React from "react";\nimport Repo from "./components/Repo";\n\nfunction App() {\n  return <Repo />;\n}\n\nexport default App;',
        'c1d2e3f4g5h6i7j8k9l0': 'import React from "react";\nimport { BrowserRouter as Router, Routes, Route } from "react-router-dom";\nimport Repo from "./components/Repo";\n\nfunction App() {\n  return (\n    <Router>\n      <Routes>\n        <Route path="/repo/:id" element={<Repo />} />\n      </Routes>\n    </Router>\n  );\n}\n\nexport default App;'
    },
    'src/components/Repo.jsx': {
        'b1c2d3e4f5g6h7i8j9k0': 'export default function Repo() {\n  return <div>Repo Component Draft</div>;\n}',
        'c1d2e3f4g5h6i7j8k9l0': 'import { useState } from "react";\n\nexport default function Repo() {\n  const [loading, setLoading] = useState(false);\n  return <div>Full Repo Component</div>;\n}'
    },
    'package.json': {
        'a1b2c3d4e5f6g7h8i9j0': '{\n  "name": "codeinit",\n  "version": "0.1.0",\n  "dependencies": {\n    "react": "^19.0.0"\n  }\n}',
        'c1d2e3f4g5h6i7j8k9l0': '{\n  "name": "codeinit",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^19.0.0",\n    "lucide-react": "^0.400.0",\n    "react-router-dom": "^7.0.0"\n  }\n}'
    }
};

export default function Repo() {
    const { id } = useParams();
    const repoPath = decodeURIComponent(id);

    const [loading, setLoading] = useState(true);
    const [isMock, setIsMock] = useState(false);
    const [commits, setCommits] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tree, setTree] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);

    // Fetch commits on mount
    useEffect(() => {
        const fetchCommits = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try fetching from real API
                const response = await fetch(`http://localhost:3000/repo/${encodeURIComponent(repoPath)}`);
                if (!response.ok) throw new Error('Backend not reachable');

                const data = await response.json();
                setCommits(data);
                setIsMock(false);
                if (data.length > 0) {
                    setCurrentIndex(data.length - 1);
                }
            } catch (err) {
                console.warn('Backend failed, falling back to mock data', err);
                // Fallback to MOCK
                setIsMock(true);
                setCommits(MOCK_COMMITS);
                setCurrentIndex(MOCK_COMMITS.length - 1);
            } finally {
                setLoading(false);
            }
        };
        fetchCommits();
    }, [repoPath]);

    // Fetch tree when commit changes
    useEffect(() => {
        if (commits.length === 0) return;

        const fetchTree = async () => {
            const commit = commits[currentIndex];
            if (isMock) {
                setTree(MOCK_TREES[commit.hash] || null);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/repo/${encodeURIComponent(repoPath)}/tree/${commit.hash}`);
                if (!response.ok) throw new Error('Failed to fetch file tree');
                const data = await response.json();
                setTree(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTree();
    }, [repoPath, commits, currentIndex, isMock]);

    // Fetch file content when selected file changes or commit changes
    useEffect(() => {
        if (!selectedFile || commits.length === 0) {
            setFileContent(null);
            return;
        }

        const fetchFileContent = async () => {
            const commit = commits[currentIndex];
            if (isMock) {
                const content = MOCK_FILES[selectedFile]?.[commit.hash] || '// No mock content for this version';
                setFileContent(content);
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:3000/repo/${encodeURIComponent(repoPath)}/file/${commit.hash}/${encodeURIComponent(selectedFile)}`
                );
                if (!response.ok) throw new Error('Failed to fetch file content');
                const data = await response.json();
                setFileContent(data.content);
            } catch (err) {
                console.error(err);
                setFileContent('Error loading file content');
            }
        };
        fetchFileContent();
    }, [repoPath, commits, currentIndex, selectedFile, isMock]);

    // Playback logic
    useEffect(() => {
        let interval;
        if (isPlaying && currentIndex < commits.length - 1) {
            interval = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= commits.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else if (currentIndex >= commits.length - 1) {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentIndex, commits.length]);

    const handleCommitChange = useCallback((index) => {
        setCurrentIndex(index);
    }, []);

    const handlePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleFileSelect = useCallback((path) => {
        setSelectedFile(path);
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-dark-950 text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary-500" size={48} />
                    <p className="text-xl font-medium animate-pulse">Analyzing Repository History...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-dark-950 text-white overflow-hidden">
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <FolderGit2 size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold truncate max-w-[400px]">
                                {repoPath.split('/').pop() || 'Dummy Repo'}
                            </h1>
                            {isMock && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                    <Info size={10} /> Mock Mode
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 font-mono truncate max-w-[400px]">
                            {repoPath}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 glass rounded-full text-sm">
                        <GitBranch size={16} className="text-primary-400" />
                        <span className="font-mono">main</span>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                        <Search size={20} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                        <Settings size={20} className="text-gray-400" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden p-6 gap-6">
                {/* Left Sidebar - File Tree */}
                <aside className="w-80 flex-shrink-0">
                    <FileTree
                        tree={tree}
                        onFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                    />
                </aside>

                {/* Center - File Viewer */}
                <section className="flex-1 min-w-0">
                    <FileViewer
                        content={fileContent}
                        filePath={selectedFile}
                    />
                </section>
            </main>

            {/* Bottom Section - Timeline */}
            <footer className="p-6 pt-0 flex-shrink-0">
                <Timeline
                    commits={commits}
                    currentIndex={currentIndex}
                    onCommitChange={handleCommitChange}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                />
            </footer>
        </div>
    );
}