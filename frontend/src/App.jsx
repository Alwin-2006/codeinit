import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PaletteShowcase from './PaletteShowcase'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='flex flex-col items-center justify-center h-screen p-10 gap-10  w-full'>
        <div>
          <h1 className='text-9xl font-bold text-center mb-8'>What if?</h1>
          <h2 className='text-4xl font-bold text-center mb-8'>You could travel back in time</h2>
          <p className='text-2xl font-bold text-center mb-8'>Just enter your project's directory and we'll show you your commit history</p>
        </div>
        <div className="w-full max-w-4xl relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-20 pr-6 py-5 bg-white border border-transparent rounded-full leading-5 text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--color-secondary)] focus:border-transparent text-xl shadow-2xl transition-all duration-300"
            placeholder="Eg. /home/user/Desktop/codeinit"
          />
        </div>
      </div>

    </>
  )
}

export default App
