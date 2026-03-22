// src/pages/AuditPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Filter } from 'lucide-react'
import api from '../lib/api'

export default function AuditPage() {
  const [data, setData] = useState({ logs:[], total:0 })
  const [users, setUsers] = useState([])
  const [filterUserId, setFilterUserId] = useState('')
  
  const load = async () => {
    const params = filterUserId ? { userId: filterUserId } : {}
    const r = await api.get('/audit', { params })
    setData(r.data)
  }
  
  useEffect(()=>{ 
    api.get('/users').then(r=>setUsers(r.data))
    load()
  },[])
  
  useEffect(()=>{ load() },[filterUserId])

  const sev = { INFO:'badge-b', WARNING:'badge-y', CRITICAL:'badge-r' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-green-400"/>
          <h1 className="stitle">Auditoria</h1>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400"/>
          <select className="inp text-xs" value={filterUserId} onChange={e=>setFilterUserId(e.target.value)}>
            <option value="">Todos os usuários</option>
            {users.map(u=><option key={u.id} value={u.id}>{u.name} (@{u.username})</option>)}
          </select>
        </div>
      </div>
      <p className="text-xs text-green-900 font-mono">{data.total} registros · Log imutável · Somente Superadmin</p>
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Data/Hora</th><th>Usuário</th><th>Ação</th><th>Módulo</th><th>Severidade</th><th>IP</th></tr></thead>
            <tbody>
              {data.logs.map(l => (
                <motion.tr key={l.id} initial={{opacity:0}} animate={{opacity:1}}>
                  <td className="font-mono text-xs text-green-800">{new Date(l.createdAt).toLocaleString('pt-BR')}</td>
                  <td><p className="text-sm text-green-200">{l.user?.name}</p><p className="text-xs text-green-800 font-mono">@{l.user?.username}</p></td>
                  <td className="font-mono text-xs text-green-500">{l.action}</td>
                  <td className="text-xs text-green-700">{l.module}</td>
                  <td><span className={`badge ${sev[l.severity]||'badge-b'}`}>{l.severity}</span></td>
                  <td className="font-mono text-xs text-green-900">{l.ipAddress||'—'}</td>
                </motion.tr>
              ))}
              {!data.logs.length && <tr><td colSpan={6} className="text-center text-green-900 py-8">Nenhum log</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
