import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PaletteShowcase from './PaletteShowcase'
import { useNavigate, Link } from 'react-router-dom'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
function App() {
  const [count, setCount] = useState(0)
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
    <>
      <div className='flex flex-col items-center justify-center h-screen p-10 gap-10  w-full'>
        <div>
          <h1 className='text-9xl font-bold text-center mb-8'>Im in the thick of it</h1>
          <h2 className='text-4xl font-bold text-center mb-8'>Everybody knows</h2>
          <p className='text-2xl font-bold text-center mb-8'>They know me when it snows i skied in and they froze</p>
        </div>
        <div className="w-full max-w-4xl relative group flex items-center">
          <input
            type="text"
            className="block w-full pl-6 pr-6 py-5 bg-white border border-transparent rounded-full leading-5 text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--color-secondary)] focus:border-transparent text-xl shadow-2xl transition-all duration-300"
            placeholder="Eg. /home/user/Desktop/codeinit"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Link
            to={repoPath.trim() ? `/repo/${encodeURIComponent(repoPath)}` : '#'}
            onClick={(e) => {
              if (!repoPath.trim()) e.preventDefault();
            }}
            className="cursor-pointer absolute right-6"
          >
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        </div>
      </div>

    </>
  )
}

export default App
