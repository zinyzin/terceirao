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
        className="md:ml-[215px] min-h-screen relative z-10"
        initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.4}}
      >
        <div className="p-5 md:p-8 pt-16 md:pt-8">
          <Outlet/>
        </div>
      </motion.main>
    </div>
  )
}
