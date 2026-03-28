import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/theme'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full p-1 transition-colors duration-300 ${
        isDark ? 'bg-slate-700' : 'bg-sky-200'
      } ${className}`}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      <motion.div
        className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
        animate={{ x: isDark ? 26 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={12} className="text-sky-300" />
        ) : (
          <Sun size={12} className="text-amber-500" />
        )}
      </motion.div>
      
      {/* Background icons */}
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px]">
        <Sun size={12} className={isDark ? 'text-slate-500' : 'text-amber-600'} />
      </span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
        <Moon size={12} className={isDark ? 'text-sky-300' : 'text-slate-400'} />
      </span>
    </button>
  )
}
