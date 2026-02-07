import { useState } from 'react'
import './App.css'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'

function App() {
  const [repoPath, setRepoPath] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (repoPath.trim()) {
      navigate(`/repo/${encodeURIComponent(repoPath)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden noise-bg flex flex-col items-center justify-center p-6">
      {/* Content wrapper */}
      <div className="relative z-20 w-full max-w-5xl space-y-12 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none animate-slide-up">
            Im in the <span className="gradient-text text-glow">thick of it</span>
          </h1>

          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl md:text-2xl font-medium text-gray-300 tracking-tight">
              Everybody knows.
            </h2>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              They know me when it snows, I skied in and they froze.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="w-full max-w-2xl group animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f34f29] to-purple-600 rounded-full blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500"></div>
            <div className="relative flex items-center">
              <Search
                className="absolute left-6 text-gray-500 group-focus-within:text-[#f34f29] transition-colors"
                size={24}
              />
              <input
                type="text"
                className="block w-full pl-16 pr-24 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full leading-5 text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-[#f34f29]/50 focus:border-[#f34f29]/50 text-lg md:text-xl shadow-2xl transition-all duration-300"
                placeholder="Paste project path eg. /home/user/codeinit"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 p-3 bg-[#f34f29] hover:bg-[#f34f29]/90 text-white rounded-full shadow-lg shadow-[#f34f29]/20 transition-all active:scale-95 md:scale-100 scale-0"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default App
