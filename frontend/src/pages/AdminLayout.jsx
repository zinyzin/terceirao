// src/pages/AdminLayout.jsx
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import ForestBg from '../components/ForestBg'

export default function AdminLayout() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ForestBg/>
      <Sidebar/>
      <motion.main
        className="min-h-screen relative z-10 md:ml-[215px]"
        initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.4}}
      >
        <div className="p-4 pt-20 md:p-8 md:pt-8">
          <Outlet/>
        </div>
      </motion.main>
    </div>
  )
}
