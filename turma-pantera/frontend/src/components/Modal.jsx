// src/components/Modal.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, maxW = 'max-w-md' }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0" style={{ background:'rgba(0,5,2,0.78)', backdropFilter:'blur(8px)' }} onClick={onClose}/>
        <motion.div
          className={`relative glass p-6 w-full ${maxW} max-h-[90vh] overflow-y-auto`}
          initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 30 }} transition={{ type:'spring', damping:22 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-green-700 hover:text-green-400 transition-colors">
            <X size={18}/>
          </button>
          {title && <h2 className="font-display text-lg font-bold text-green-200 mb-5">{title}</h2>}
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
