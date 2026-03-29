// src/components/Modal.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, maxW = 'max-w-md' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0" style={{ background:'rgba(3,7,18,0.76)', backdropFilter:'blur(10px)' }} onClick={onClose}/>
          <motion.div
            className={`relative glass p-6 w-full ${maxW} max-h-[90vh] overflow-y-auto`}
            initial={{ scale: 0.82, y: 28 }} animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.82, y: 28 }} transition={{ type:'tween', duration:0.18, ease:'easeOut' }}
            style={{ boxShadow:'0 24px 80px rgba(2,6,23,0.55), 0 0 40px rgba(96,165,250,0.08)' }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-blue-300 transition-colors">
              <X size={18}/>
            </button>
            {title && <h2 className="font-display text-lg font-bold text-blue-100 mb-5">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
