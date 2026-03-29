// src/pages/AdminLayout.jsx
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import ForestBg from '../components/ForestBg'
import { LayoutDashboard, Users, GraduationCap, UserCheck, DollarSign, Ticket, Package, Shield, ClipboardList, Settings, Trash2, FileText, Calendar, Images } from 'lucide-react'

const NAV_LABELS = [
  { to:'/admin/dash', label:'Dashboard', icon:LayoutDashboard },
  { to:'/admin/alunos', label:'Alunos', icon:Users },
  { to:'/admin/professores', label:'Professores', icon:GraduationCap },
  { to:'/admin/contribuidores', label:'Contribuidores', icon:UserCheck },
  { to:'/admin/financeiro', label:'Financeiro', icon:DollarSign },
  { to:'/admin/produtos', label:'Produtos', icon:Package },
  { to:'/admin/rifas', label:'Rifas', icon:Ticket },
  { to:'/admin/events', label:'Eventos', icon:Calendar },
  { to:'/admin/galeria', label:'Galeria', icon:Images },
  { to:'/admin/reports', label:'Relatórios', icon:FileText },
  { to:'/admin/settings', label:'Configurações', icon:Settings },
  { to:'/admin/trash', label:'Lixeira', icon:Trash2 },
  { to:'/admin/users', label:'Usuários', icon:Shield },
  { to:'/admin/audit', label:'Auditoria', icon:ClipboardList },
]

export default function AdminLayout() {
  const location = useLocation()
  const current = NAV_LABELS.find(n => location.pathname.startsWith(n.to))
  const Icon = current?.icon

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ForestBg/>
      <Sidebar/>
      <motion.main
        className="min-h-screen relative z-10 md:ml-[215px]"
        initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.4}}
      >
        {/* Mobile breadcrumb bar */}
        {current && (
          <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
            {Icon && <Icon size={14} className="text-sky-400 flex-shrink-0"/>}
            <span className="text-sm font-semibold text-blue-100">{current.label}</span>
          </div>
        )}
        <div className="p-4 pt-4 md:p-8 md:pt-8">
          <Outlet/>
        </div>
      </motion.main>
    </div>
  )
}
