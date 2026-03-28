// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, DollarSign,
  Ticket, Package, Shield, ClipboardList, Settings, Trash2, LogOut, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import Panther from './Panther'
import ThemeToggle from './ThemeToggle'
import { useAuthStore } from '../store/auth'
import api from '../lib/api'

const NAV = [
  { to:'/admin/dash', icon:LayoutDashboard, label:'Dashboard', role:'admin' },
  { to:'/admin/alunos', icon:Users, label:'Alunos', role:'admin' },
  { to:'/admin/professores', icon:GraduationCap, label:'Professores', role:'admin' },
  { to:'/admin/contribuidores', icon:UserCheck, label:'Contribuidores', role:'admin' },
  { to:'/admin/financeiro', icon:DollarSign, label:'Financeiro', role:'admin' },
  { to:'/admin/produtos', icon:Package, label:'Produtos', role:'admin' },
  { to:'/admin/rifas', icon:Ticket, label:'Rifas', role:'admin' },
  { to:'/admin/settings', icon:Settings, label:'Configurações', role:'superadmin' },
  { to:'/admin/trash', icon:Trash2, label:'Lixeira', role:'superadmin' },
  { to:'/admin/users', icon:Shield, label:'Usuários', role:'superadmin' },
  { to:'/admin/audit', icon:ClipboardList, label:'Auditoria', role:'superadmin' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mob, setMob] = useState(false)
  const { user, logout, isAdmin, isSA } = useAuthStore()
  const nav = useNavigate()

  const has = role => {
    if (role === 'admin') return isAdmin()
    if (role === 'superadmin') return isSA()
    return true
  }

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    logout()
    nav('/')
  }

  const Inner = ({ close }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-blue-300/10 ${collapsed?'justify-center':''}`}>
        <motion.div animate={{ y:[0,-3,0] }} transition={{ duration:4, repeat:Infinity }}>
          <Panther size={collapsed?36:44} glow/>
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <p className="font-display text-sm font-bold text-blue-100 leading-tight">Turma Pantera</p>
              <p className="text-xs text-sky-200/70 tracking-widest">3º ANO</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV.filter(n => has(n.role)).map(n => (
          <NavLink key={n.to} to={n.to} onClick={close}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-semibold ${
                isActive ? 'nav-active' : 'text-slate-300 hover:text-blue-100 hover:bg-blue-500/10'
              } ${collapsed?'justify-center':''}`
            }
          >
            {({ isActive }) => (
              <>
                <n.icon size={17} className={`flex-shrink-0 ${isActive?'drop-shadow-[0_0_6px_#60a5fa]':''}`}/>
                <AnimatePresence>
                  {!collapsed && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{n.label}</motion.span>}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-blue-300/10 p-3 space-y-2">
        {!collapsed && (
          <div className="px-2">
            <p className="text-xs font-semibold text-blue-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 font-mono">{user?.role}</p>
          </div>
        )}
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <ThemeToggle />
          {!collapsed && <span className="text-xs text-slate-400">Tema</span>}
        </div>
        <button onClick={handleLogout}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-900/15 transition-all text-sm ${collapsed?'justify-center':''}`}>
          <LogOut size={15}/>
          {!collapsed && 'Sair'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button className="fixed top-4 left-4 z-50 md:hidden glass p-2 rounded-xl" onClick={() => setMob(!mob)}>
        {mob ? <X size={18} className="text-blue-300"/> : <Menu size={18} className="text-blue-300"/>}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mob && (
          <>
            <motion.div className="fixed inset-0 z-40 md:hidden" style={{background:'rgba(0,0,0,0.6)'}}
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setMob(false)}/>
            <motion.aside className="fixed left-0 top-0 bottom-0 w-60 z-50 md:hidden"
              style={{ background:'rgba(2,6,23,0.97)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(96,165,250,0.15)' }}
              initial={{x:-240}} animate={{x:0}} exit={{x:-240}} transition={{type:'spring',damping:25}}>
              <Inner close={() => setMob(false)}/>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 215 }}
        transition={{ type:'spring', damping:25, stiffness:180 }}
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30"
        style={{ background:'rgba(2,6,23,0.93)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(96,165,250,0.12)' }}
      >
        <Inner close={() => {}}/>
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 glass p-1 rounded-full text-slate-400 hover:text-blue-300 transition-colors">
          {collapsed ? <ChevronRight size={13}/> : <ChevronLeft size={13}/>}
        </button>
      </motion.aside>
    </>
  )
}
