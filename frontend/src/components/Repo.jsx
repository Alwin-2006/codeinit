import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import FileTree from './FileTree';
import FileViewer from './FileViewer';
import Timeline from './Timeline';
import { GitBranch, FolderGit2, Search, Settings, Loader2 } from 'lucide-react';

export default function Repo() {
    const { id } = useParams();
    const repoPath = decodeURIComponent(id);

    const [loading, setLoading] = useState(true);
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
                const response = await fetch(`http://localhost:3000/repo/${encodeURIComponent(repoPath)}`);
                if (!response.ok) throw new Error('Failed to fetch commits');
                const data = await response.json();
                setCommits(data);
                if (data.length > 0) {
                    setCurrentIndex(data.length - 1); // Start at latest commit
                }
            } catch (err) {
                setError(err.message);
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
            try {
                const commit = commits[currentIndex];
                const response = await fetch(`http://localhost:3000/repo/${encodeURIComponent(repoPath)}/tree/${commit.hash}`);
                if (!response.ok) throw new Error('Failed to fetch file tree');
                const data = await response.json();
                setTree(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTree();
    }, [repoPath, commits, currentIndex]);

    // Fetch file content when selected file changes or commit changes
    useEffect(() => {
        if (!selectedFile || commits.length === 0) {
            setFileContent(null);
            return;
        }

        const fetchFileContent = async () => {
            try {
                const commit = commits[currentIndex];
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
    }, [repoPath, commits, currentIndex, selectedFile]);

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

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-dark-950 text-white p-6">
                <div className="glass p-8 rounded-2xl max-w-md text-center border-red-500/30">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Settings className="text-red-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Connection Failed</h2>
                    <p className="text-gray-400 mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-xl transition-all font-bold"
                    >
                        Retry Connection
                    </button>
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
                        <h1 className="text-lg font-bold truncate max-w-[400px]">
                            {repoPath.split('/').pop()}
                        </h1>
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