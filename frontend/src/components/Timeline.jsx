import { useState, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Search as SearchIcon, Calendar } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from "@/components/ui/button.jsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import Avatar from './Avatar';

export default function Timeline({ commits, currentIndex, onCommitChange, isPlaying, onPlayPause }) {
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [authorFilter, setAuthorFilter] = useState('all');

    const authors = useMemo(() => {
        const uniqueAuthors = new Set(commits.map(c => c.author));
        return Array.from(uniqueAuthors).sort();
    }, [commits]);

    const filteredCommits = useMemo(() => {
        return commits.map((commit, index) => ({ ...commit, originalIndex: index }))
            .filter(commit => {
                const matchesSearch = commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    commit.shortHash.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesDate = !dateFilter || new Date(commit.timestamp) <= new Date(dateFilter);

                const matchesAuthor = authorFilter === 'all' || commit.author === authorFilter;

                return matchesSearch && matchesDate && matchesAuthor;
            });
    }, [commits, searchQuery, dateFilter, authorFilter]);

    const handleCommitSelect = (index) => {
        onCommitChange(index);
        setIsDialogOpen(false);
        setSearchQuery('');
        setDateFilter('');
        setAuthorFilter('all');
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            onCommitChange(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < commits.length - 1) {
            onCommitChange(currentIndex + 1);
        }
    };

    const handleFirst = () => {
        onCommitChange(0);
    };

    const handleLast = () => {
        onCommitChange(commits.length - 1);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!commits || commits.length === 0) {
        return null;
    }

    const currentCommit = commits[currentIndex];
    const progress = ((currentIndex + 1) / commits.length) * 100;

    return (
        <div className="glass rounded-xl p-6 space-y-4">
            {/* Current Commit Info */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold gradient-text">
                            {currentCommit.message.split('\n')[0]}
                        </h3>
                        <span className="glass-dark px-3 py-1 rounded-full text-xs font-mono">
                            {currentCommit.shortHash}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Avatar name={currentCommit.author} email={currentCommit.email} size={24} />
                        <p className="text-sm text-gray-400">
                            {currentCommit.author} • {formatDate(currentCommit.timestamp)}
                        </p>
                    </div>
                    {currentCommit.stats && (
                        <p className="text-xs text-gray-500 mt-2 ml-8">
                            {currentCommit.stats.filesChanged} file(s) changed
                        </p>
                    )}
                </div>
                <div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 glass-dark border-white/10 hover:bg-white/5">
                                <SearchIcon size={16} /> Navigate
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-white/10 text-white p-0 overflow-hidden">
                            <DialogHeader className="p-6 pb-0 flex flex-col justify-between">
                                <DialogTitle className="text-2xl font-bold flex justify-center">Options</DialogTitle>
                            </DialogHeader>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date-filter" className="text-xs text-gray-400 uppercase tracking-wider">Before Date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <Input
                                                id="date-filter"
                                                type="date"
                                                value={dateFilter}
                                                onChange={(e) => setDateFilter(e.target.value)}
                                                className="pl-10 bg-black/50 border-white/10 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="author-filter" className="text-xs text-gray-400 uppercase tracking-wider">Author</Label>
                                        <Select value={authorFilter} onValueChange={setAuthorFilter}>
                                            <SelectTrigger id="author-filter" className="bg-black/50 border-white/10 focus:ring-primary-500">
                                                <SelectValue placeholder="All Authors" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                <SelectItem value="all">All Authors</SelectItem>
                                                {authors.map(author => (
                                                    <SelectItem key={author} value={author}>{author}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="search-query" className="text-xs text-gray-400 uppercase tracking-wider">Search Message</Label>
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <Input
                                            id="search-query"
                                            placeholder="Fix bug, initial..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && filteredCommits.length > 0) {
                                                    handleCommitSelect(filteredCommits[0].originalIndex);
                                                }
                                            }}
                                            className="pl-10 bg-black/50 border-white/10 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <Label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                                        Results ({filteredCommits.length})
                                    </Label>
                                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                        {filteredCommits.length > 0 ? (
                                            filteredCommits.map((commit) => (
                                                <button
                                                    key={commit.hash}
                                                    onClick={() => handleCommitSelect(commit.originalIndex)}
                                                    className={`w-full text-left p-3 rounded-lg transition-all border ${commit.originalIndex === currentIndex
                                                        ? 'bg-primary/20 border-primary/30 text-white'
                                                        : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-mono text-xs text-primary-400">{commit.shortHash}</span>
                                                        <span className="text-[10px] text-gray-500">{formatDate(commit.timestamp)}</span>
                                                    </div>
                                                    <p className="text-sm font-medium line-clamp-1">{commit.message}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Avatar name={commit.author} email={commit.email} size={18} />
                                                        <p className="text-[11px] text-gray-500">{commit.author}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <SearchIcon className="mx-auto mb-2 opacity-20" size={32} />
                                                <p>No commits found matching filter</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary-400">
                        {currentIndex + 1} / {commits.length}
                    </div>
                    <div className="text-xs text-gray-500">commits</div>
                </div>
            </div>

            {/* Timeline Slider with Markers */}
            <div className="relative pt-6 pb-2">
                {/* Commit markers - positioned above/behind the slider */}
                <div className="absolute top-0 inset-x-0 flex justify-between px-1 pointer-events-none">
                    {commits.map((_, index) => (
                        <div
                            key={index}
                            className={`w-1 h-3 rounded-full transition-all ${index === currentIndex
                                ? 'bg-white scale-150 shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                                : index < currentIndex
                                    ? 'bg-primary/80'
                                    : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                <Slider
                    min={0}
                    max={commits.length - 1}
                    step={1}
                    value={[currentIndex]}
                    onValueChange={(vals) => onCommitChange(vals[0])}
                    className="w-full cursor-pointer relative z-10"
                    style={{
                        "--color-primary": "#f34f29",
                        "--color-muted": "rgba(243, 79, 41, 0.2)", // Translucent version of the same color for the track
                        "--color-ring": "#f34f29"
                    }}
                />
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleFirst}
                        disabled={currentIndex === 0}
                        className="p-2 glass-dark hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="First commit"
                    >
                        <SkipBack size={20} />
                    </button>
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="p-2 glass-dark hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Previous commit"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={onPlayPause}
                        className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === commits.length - 1}
                        className="p-2 glass-dark hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Next commit"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <button
                        onClick={handleLast}
                        disabled={currentIndex === commits.length - 1}
                        className="p-2 glass-dark hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Last commit"
                    >
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Speed:</span>
                    <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="glass-dark px-3 py-2 rounded-lg text-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="2">2x</option>
                        <option value="4">4x</option>
                    </select>
                </div>
            </div>
        </div >
    );
}