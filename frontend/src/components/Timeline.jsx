import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';

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

            {/* Timeline Progress Bar */}
            <div className="space-y-2">
                <div className="relative h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-600 to-purple-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                    {/* Commit markers */}
                    <div className="absolute inset-0 flex justify-between px-1">
                        {commits.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => onCommitChange(index)}
                                className={`w-1 h-2 rounded-full transition-all hover:scale-150 ${index === currentIndex
                                    ? 'bg-white scale-150'
                                    : index < currentIndex
                                        ? 'bg-primary-400'
                                        : 'bg-gray-600'
                                    }`}
                                title={`Commit ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Timeline Slider */}
                <input
                    type="range"
                    min="0"
                    max={commits.length - 1}
                    value={currentIndex}
                    onChange={(e) => onCommitChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
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
                        className="p-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-all"
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