// src/components/Panther.jsx
import { motion } from 'framer-motion'

export default function Panther({ size = 80, glow = false, animate = true }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 200 200" fill="none"
      animate={animate ? { y: [0,-5,0] } : {}}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx="100" cy="132" rx="52" ry="43" fill="#090909"/>
      <ellipse cx="100" cy="84" rx="44" ry="42" fill="#101010"/>
      <polygon points="60,57 49,29 76,52" fill="#0c0c0c"/>
      <polygon points="140,57 151,29 124,52" fill="#0c0c0c"/>
      <polygon points="62,54 55,37 74,51" fill="#1a0d1a" opacity="0.6"/>
      <polygon points="138,54 145,37 126,51" fill="#1a0d1a" opacity="0.6"/>
      <ellipse cx="100" cy="95" rx="21" ry="17" fill="#141414"/>
      {/* Eyes */}
      <motion.g
        animate={glow ? { opacity:[1,.82,1], scale:[1,1.06,1] } : {}}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={glow ? { filter:'drop-shadow(0 0 7px #00ff88) drop-shadow(0 0 16px #00ff8866)' } : {}}
      >
        <ellipse cx="82" cy="82" rx="8" ry="6.5" fill="#001200"/>
        <ellipse cx="82" cy="82" rx="5.5" ry="4.5" fill="#00cc55"/>
        <ellipse cx="82" cy="82" rx="2.5" ry="3.5" fill="#001200"/>
        <ellipse cx="80.5" cy="80.5" rx="1.4" ry="1.4" fill="#00ff88"/>
        <ellipse cx="118" cy="82" rx="8" ry="6.5" fill="#001200"/>
        <ellipse cx="118" cy="82" rx="5.5" ry="4.5" fill="#00cc55"/>
        <ellipse cx="118" cy="82" rx="2.5" ry="3.5" fill="#001200"/>
        <ellipse cx="116.5" cy="80.5" rx="1.4" ry="1.4" fill="#00ff88"/>
      </motion.g>
      <ellipse cx="100" cy="95" rx="3.5" ry="2.8" fill="#180c18"/>
      {/* Whiskers */}
      {[[104,96,129,91],[104,99,129,99],[104,102,129,107],[96,96,71,91],[96,99,71,99],[96,102,71,107]].map((w,i)=>(
        <line key={i} x1={w[0]} y1={w[1]} x2={w[2]} y2={w[3]} stroke="#2a2a2a" strokeWidth="1"/>
      ))}
      <ellipse cx="100" cy="148" rx="22" ry="18" fill="#161616"/>
      <ellipse cx="77" cy="167" rx="11" ry="7" fill="#101010"/>
      <ellipse cx="123" cy="167" rx="11" ry="7" fill="#101010"/>
      <path d="M145 142 Q168 120 173 150 Q164 168 144 163" fill="none" stroke="#0c0c0c" strokeWidth="7" strokeLinecap="round"/>
    </motion.svg>
  )
}
