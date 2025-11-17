'use client'
import { TracingLogo } from '@/components/ui/tracing-logo'
import { useEffect, useState } from 'react'

export default function TestTracingPage() {
  const [size, setSize] = useState(320)
  const [duration, setDuration] = useState(6)
  const [strokeColor, setStrokeColor] = useState('#513379')
  const [strokeWidth, setStrokeWidth] = useState(80)
  const [animationKey, setAnimationKey] = useState(0)

  // Restart animation every 7 seconds (6s draw + 1s pause)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1)
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  const handleRestart = () => {
    setAnimationKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Tracing Animation Test
        </h1>
        
        {/* Animation Display */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <TracingLogo 
              key={animationKey}
              size={size} 
              duration={duration} 
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Animation Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Size Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Size: {size}px
              </label>
              <input
                type="range"
                min="20"
                max="500"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            {/* Duration Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration: {duration}s
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            {/* Stroke Width Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stroke Width: {strokeWidth}
              </label>
              <input
                type="range"
                min="20"
                max="500"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            {/* Color Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="text-center">
            <p className="text-lg font-medium text-white mb-2">Drawing Animation</p>
            <div className="flex items-center justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Manual restart button */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <button
            onClick={handleRestart}
            className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Restart Animation
          </button>
        </div>



        {/* Preset Examples */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Preset Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fast Red */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-2">Fast Red</h3>
              <div className="flex justify-center mb-3">
                <TracingLogo size={120} duration={2} strokeColor="#ff0000" strokeWidth={60} />
              </div>
              <button
                onClick={() => {
                  setSize(120)
                  setDuration(2)
                  setStrokeColor('#ff0000')
                  setStrokeWidth(60)
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Apply
              </button>
            </div>
            {/* Slow Blue */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-2">Slow Blue</h3>
              <div className="flex justify-center mb-3">
                <TracingLogo size={160} duration={8} strokeColor="#0066ff" strokeWidth={90} />
              </div>
              <button
                onClick={() => {
                  setSize(160)
                  setDuration(8)
                  setStrokeColor('#0066ff')
                  setStrokeWidth(90)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Apply
              </button>
            </div>
            {/* Thick Green */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-2">Thick Green</h3>
              <div className="flex justify-center mb-3">
                <TracingLogo size={200} duration={4} strokeColor="#00ff00" strokeWidth={120} />
              </div>
              <button
                onClick={() => {
                  setSize(200)
                  setDuration(4)
                  setStrokeColor('#00ff00')
                  setStrokeWidth(120)
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
} 