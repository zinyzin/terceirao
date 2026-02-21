// src/components/ForestBg.jsx
import { useEffect, useRef } from 'react'

export default function ForestBg() {
  const bgRef = useRef()

  useEffect(() => {
    const move = e => {
      if (!bgRef.current) return
      const x = (e.clientX / window.innerWidth - 0.5) * 14
      const y = (e.clientY / window.innerHeight - 0.5) * 7
      bgRef.current.style.transform = `translate(${x}px,${y}px) scale(1.05)`
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div ref={bgRef} className="bg-forest" style={{ transition:'transform 0.4s ease-out' }}/>
      <div className="bg-vignette"/>
      {/* Fireflies */}
      <div style={{ position:'fixed', inset:0, zIndex:2, pointerEvents:'none' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="ff-particle animate-ff" style={{
            width: `${2+Math.random()*3}px`,
            height: `${2+Math.random()*3}px`,
            left: `${5+Math.random()*90}%`,
            top: `${15+Math.random()*70}%`,
            animationDuration: `${4+Math.random()*7}s`,
            animationDelay: `${Math.random()*6}s`,
          }}/>
        ))}
      </div>
    </>
  )
}
