// src/components/ConfirmModal.jsx
import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

const useConfirmStore = create(set => ({
  open: false,
  title: '',
  message: '',
  resolve: null,
  show: (title, message) => new Promise(resolve =>
    set({ open: true, title, message, resolve })
  ),
  hide: () => set({ open: false, resolve: null }),
}))

export const confirm = (message, title = 'Confirmar') =>
  useConfirmStore.getState().show(title, message)

export default function ConfirmModal() {
  const { open, title, message, resolve, hide } = useConfirmStore()

  const handleConfirm = () => { resolve(true); hide() }
  const handleCancel  = () => { resolve(false); hide() }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(3,7,18,0.82)', backdropFilter: 'blur(12px)' }}
            onClick={handleCancel}
          />
          <motion.div
            className="relative glass p-6 w-full max-w-sm"
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 22 }}
            style={{ boxShadow: '0 24px 80px rgba(2,6,23,0.6), 0 0 40px rgba(255,80,80,0.06)' }}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.25)' }}>
                <AlertTriangle size={18} className="text-red-400"/>
              </div>
              <div>
                <h3 className="font-display font-bold text-blue-50 text-base">{title}</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{message}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCancel} className="btn-ghost flex-1 justify-center">Cancelar</button>
              <button onClick={handleConfirm} className="btn-danger flex-1 justify-center">Confirmar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
