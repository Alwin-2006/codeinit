import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function Timeline({ commits, currentIndex, onCommitChange, isPlaying, onPlayPause }) {
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

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
                    <p className="text-sm text-gray-400 mt-1">
                        {currentCommit.author} • {formatDate(currentCommit.timestamp)}
                    </p>
                    {currentCommit.stats && (
                        <p className="text-xs text-gray-500 mt-1">
                            {currentCommit.stats.filesChanged} file(s) changed
                        </p>
                    )}
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
        </div>
    );
}