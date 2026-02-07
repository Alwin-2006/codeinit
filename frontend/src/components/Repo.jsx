import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import FileTree from './FileTree';
import FileViewer from './FileViewer';
import Timeline from './Timeline';
import { GitBranch, FolderGit2, Search, Settings, Loader2, Info } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
    const [newdir, setNewdir] = useState('');
    const [pathPrefix, setPathPrefix] = useState('');
    const [diffData, setDiffData] = useState(null);

    const navigate = useNavigate();

    const changedFiles = useMemo(() => {
        const currentCommit = commits[currentIndex];
        if (!currentCommit?.stats?.files) return new Set();

        const files = currentCommit.stats.files;
        const normalized = files
            .filter(f => !pathPrefix || f.path.startsWith(pathPrefix + '/'))
            .map(f => pathPrefix ? f.path.substring(pathPrefix.length + 1) : f.path);

        return new Set(normalized);
    }, [commits, currentIndex, pathPrefix]);

    const handleSearch = () => {
        if (newdir.trim()) {
            navigate(`/repo/${encodeURIComponent(newdir)}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    useEffect(() => {
        const fetchCommits = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`http://localhost:3000/api/commits?repo=${encodeURIComponent(repoPath)}`);
                if (!response.ok) throw new Error('Backend not reachable');

                const data = await response.json();
                const commitsData = data.commits || [];
                setCommits(commitsData);
                setPathPrefix(data.pathPrefix || '');
                setIsMock(false);
                if (commitsData.length > 0) {
                    setCurrentIndex(commitsData.length - 1);
                }
            } catch (err) {
                console.warn('Backend failed, falling back to mock data', err);
                setIsMock(true);
                setCommits(MOCK_COMMITS);
                setCurrentIndex(MOCK_COMMITS.length - 1);
            } finally {
                setLoading(false);
            }
        };
        fetchCommits();
    }, [repoPath]);

    useEffect(() => {
        if (commits.length === 0) return;

        const fetchTree = async () => {
            const commit = commits[currentIndex];
            if (isMock) {
                setTree(MOCK_TREES[commit.hash] || null);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/api/tree?repo=${encodeURIComponent(repoPath)}&commit=${commit.hash}`);
                if (!response.ok) throw new Error('Failed to fetch file tree');
                const data = await response.json();
                setTree(data.tree);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTree();
    }, [repoPath, commits, currentIndex, isMock]);

    useEffect(() => {
        if (!selectedFile || commits.length === 0) {
            setFileContent(null);
            return;
        }

        const fetchFileData = async () => {
            const commit = commits[currentIndex];
            const prevCommit = currentIndex > 0 ? commits[currentIndex - 1] : null;

            if (isMock) {
                const content = MOCK_FILES[selectedFile]?.[commit.hash] || '// No mock content for this version';
                setFileContent(content);
                setDiffData(null); // Reset diff for mock
                return;
            }

            try {
                // Fetch content
                const contentResponse = await fetch(
                    `http://localhost:3000/api/file?repo=${encodeURIComponent(repoPath)}&commit=${commit.hash}&path=${encodeURIComponent(selectedFile)}`
                );
                if (!contentResponse.ok) throw new Error('Failed to fetch file content');
                const contentData = await contentResponse.json();
                setFileContent(contentData.content);

                // Fetch diff if not first commit
                if (prevCommit) {
                    const diffResponse = await fetch(
                        `http://localhost:3000/api/diff?repo=${encodeURIComponent(repoPath)}&from=${prevCommit.hash}&to=${commit.hash}&path=${encodeURIComponent(selectedFile)}`
                    );
                    if (diffResponse.ok) {
                        const dData = await diffResponse.json();
                        setDiffData(dData.diff);
                    } else {
                        setDiffData(null);
                    }
                } else {
                    setDiffData(null);
                }
            } catch (err) {
                console.error(err);
                setFileContent('Error loading file content');
                setDiffData(null);
            }
        };
        fetchFileData();
    }, [repoPath, commits, currentIndex, selectedFile, isMock]);


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
            <div className="h-screen flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary-500" size={48} />
                    <p className="text-xl font-medium animate-pulse">Analyzing Repository History...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col  text-white overflow-hidden">
            {/* Navbar */}
            <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-white/5 gap-4 flex-shrink-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
                        <Link to="/">
                            <FolderGit2 size={24} />
                        </Link>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-[400px]">
                                {repoPath.split('/').pop() || 'Dummy Repo'}
                            </h1>
                            {isMock && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                                    <Info size={10} /> Mock
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 font-mono truncate hidden sm:block max-w-[300px]">
                            {repoPath}
                        </p>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-2xl px-0 md:px-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-400 transition-colors" size={20} />
                        <input
                            type="text"
                            className="block w-full pl-12 pr-6 py-2.5 bg-white/5 border border-white/10 rounded-full leading-5 text-white placeholder-gray-500 focus:outline-none focus:bg-white focus:text-black focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500/50 text-base md:text-lg shadow-xl transition-all duration-300"
                            placeholder="Eg. /home/user/Desktop/codeinit"
                            value={newdir}
                            onChange={(e) => setNewdir(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm">
                        <GitBranch size={16} className="text-primary-400" />
                        <span className="font-mono">main</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-4 md:gap-6">
                <aside className="w-full md:w-80 flex-shrink-0 flex flex-col min-h-0">
                    <FileTree
                        tree={tree}
                        onFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                        changedFiles={changedFiles}
                    />
                </aside>

                <section className="flex-1 min-w-0 flex flex-col min-h-0">
                    <FileViewer
                        content={fileContent}
                        filePath={selectedFile}
                        diff={diffData}
                    />
                </section>
            </main>

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