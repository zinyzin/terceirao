// src/pages/AuditPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import api from '../lib/api'

export default function AuditPage() {
  const [data, setData] = useState({ logs:[], total:0 })
  const [users, setUsers] = useState([])
  const [filterUserId, setFilterUserId] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const load = async () => {
    const params = new URLSearchParams()
    if (filterUserId) params.append('userId', filterUserId)
    params.append('page', page)
    params.append('limit', limit)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const r = await api.get(`/audit?${params.toString()}`)
    setData(r.data)
  }
  
  useEffect(()=>{ 
    api.get('/users').then(r=>setUsers(r.data))
    load()
  },[])
  
  useEffect(()=>{ 
    setPage(1)
    load() 
  },[filterUserId, startDate, endDate])
  
  useEffect(()=>{ load() },[page])

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
      
      {/* Filters */}
      <div className="glass p-4 flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-slate-400"/>
        <select className="inp text-xs" value={filterUserId} onChange={e=>setFilterUserId(e.target.value)}>
          <option value="">Todos os usuários</option>
          {users.map(u=><option key={u.id} value={u.id}>{u.name} (@{u.username})</option>)}
        </select>
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-green-800"/>
          <input 
            type="date" 
            className="inp text-xs py-1 px-2" 
            value={startDate} 
            onChange={e=>setStartDate(e.target.value)}
          />
          <span className="text-green-800">-</span>
          <input 
            type="date" 
            className="inp text-xs py-1 px-2" 
            value={endDate} 
            onChange={e=>setEndDate(e.target.value)}
          />
        </div>
        {(startDate || endDate || filterUserId) && (
          <button 
            className="text-xs text-green-800 hover:text-green-600"
            onClick={()=>{setStartDate(''); setEndDate(''); setFilterUserId(''); setPage(1)}}
          >
            Limpar
          </button>
        )}
      </div>

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
        
        {/* Pagination */}
        {data.total > 0 && (
          <div className="p-4 border-t border-green-900/40 flex items-center justify-between">
            <p className="text-xs text-green-800">
              Mostrando {((page-1)*limit)+1} - {Math.min(page*limit, data.total)} de {data.total} registros
            </p>
            <div className="flex gap-2">
              <button 
                className="btn-ghost px-3 py-1 text-xs disabled:opacity-50"
                onClick={()=>setPage(p=>p-1)}
                disabled={page <= 1}
              >
                <ChevronLeft size={14}/> Anterior
              </button>
              <span className="text-xs text-green-800 py-1">Página {page}</span>
              <button 
                className="btn-ghost px-3 py-1 text-xs disabled:opacity-50"
                onClick={()=>setPage(p=>p+1)}
                disabled={page*limit >= data.total}
              >
                Próxima <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
