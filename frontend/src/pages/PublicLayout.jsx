// src/pages/PublicLayout.jsx
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import ForestBg from '../components/ForestBg'
import PublicTabs from '../components/PublicTabs'

export default function PublicLayout() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ForestBg/>
      <motion.main
        className="page-shell pt-4 pb-12"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      >
        <div className="max-w-5xl mx-auto space-y-5">
          <PublicTabs/>
          <Outlet/>
        </div>
      </motion.main>
    </div>
  )
}
