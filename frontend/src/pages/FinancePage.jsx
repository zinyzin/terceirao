// src/pages/FinancePage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, RefreshCw, Download, Trash2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { confirm } from '../components/ConfirmModal'
import { toast } from '../components/Toast'

const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`

export default function FinancePage() {
  const { isAuth, can, user } = useAuthStore()
  const [wallet, setWallet] = useState(null)
  const [ledger, setLedger] = useState({ entries:[], total:0 })
  const [students, setStudents] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ amount:'', description:'', studentId:'' })
  const [err, setErr] = useState('')
  const [publicData, setPublicData] = useState(null)
  
  // Pagination and filters
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const isAllowed = isAuth && can('finance:detail')
  const isSuperadmin = user?.role === 'SUPERADMIN'

  const load = async () => {
    if (!isAllowed) {
      const [financeRes, ledgerRes] = await Promise.all([
        axios.get('/api/public/finance'),
        axios.get('/api/public/ledger')
      ])
      setPublicData(financeRes.data)
      setLedger(ledgerRes.data)
      return
    }
    
    // Build query params for pagination and filters
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('limit', limit)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (typeFilter) params.append('type', typeFilter)
    
    const [w,l,s] = await Promise.all([
      api.get('/finance/wallet'), 
      api.get(`/finance/ledger?${params.toString()}`), 
      api.get('/students')
    ])
    setWallet(w.data); setLedger(l.data); setStudents(s.data)
  }

  useEffect(()=>{ load() },[isAllowed, page, startDate, endDate, typeFilter])

  const submit = async e => {
    e.preventDefault(); setErr('')
    try {
      await api.post(`/finance/${modal}`, { ...form, amount:parseFloat(form.amount) })
      setModal(null); setForm({amount:'',description:'',studentId:''}); load()
    } catch(e) { setErr(e.response?.data?.error||'Erro') }
  }

  const reverse = async id => {
    if (!await confirm('Confirmar o estorno desta transação?', 'Estornar')) return
    try {
      await api.post(`/finance/reverse/${id}`)
      toast.success('Estorno realizado.')
      load()
    } catch (e) { toast.error(e.response?.data?.error || 'Erro ao estornar') }
  }

  const deleteEntry = async id => {
    if (!await confirm('Deletar esta transação permanentemente? Esta ação não pode ser desfeita.', 'Deletar Transação')) return
    try {
      await api.delete(`/finance/ledger/${id}`)
      toast.success('Transação removida.')
      load()
    } catch (e) { toast.error(e.response?.data?.error || 'Erro ao deletar') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="stitle">Financeiro</h1>
        {isAllowed && (
          <div className="flex gap-2 flex-wrap">
            <a href="/api/finance/export/csv" className="btn-ghost text-xs"><Download size={13}/>CSV</a>
            <button className="btn-danger" onClick={()=>{setErr('');setModal('debit')}}><TrendingDown size={14}/>Saída</button>
            <button className="btn-g" onClick={()=>{setErr('');setModal('credit')}}><TrendingUp size={14}/>Entrada</button>
          </div>
        )}
      </div>

      {/* Stats cards for all users */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {l:'Saldo Atual', v:fmt(isAllowed ? wallet?.balance : ledger?.balance), c:'#00ff88'},
          {l:'Total Arrecadado', v:fmt(publicData?.raised || (isAllowed ? wallet?.balance : ledger?.balance)), c:'#00ccff'},
          {l:'Registros', v:ledger?.total || 0, c:'#ffcc00'},
        ].map((s,i)=>(
          <motion.div key={s.l} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.08}} className="glass p-5">
            <p className="text-xs text-green-800 uppercase tracking-wider mb-2">{s.l}</p>
            <p className="font-display text-2xl font-bold" style={{color:s.c}}>{s.v}</p>
          </motion.div>
        ))}
      </div>

      {/* Goal progress for all users */}
      <div className="glass p-5">
        <p className="text-xs text-green-800 uppercase tracking-wider mb-3">Termômetro da Formatura</p>
        <div className="w-full h-4 rounded-full" style={{ background:'rgba(0,255,136,0.10)', border:'1px solid rgba(0,255,136,0.16)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.round((publicData?.progress ?? (ledger?.balance / (publicData?.goalAmount || 1))) * 100)}%`,
              background: 'linear-gradient(90deg,#00ff88,#00ccff)',
              boxShadow: '0 0 16px rgba(0,255,136,0.25)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-3">
          <span className="text-green-800">Arrecadado</span>
          <span className="money-pos font-mono font-bold">{fmt(publicData?.raised || ledger?.balance)}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-green-800">Meta</span>
          <span className="text-green-500 font-mono font-bold">{fmt(publicData?.goalAmount)}</span>
        </div>
        {!isAllowed && (
          <p className="text-xs text-green-900 mt-4">Você tem acesso apenas para visualização. Entre em contato com um administrador para adicionar entradas ou saídas.</p>
        )}
      </div>

      {/* Ledger table for all users */}
      <div className="glass overflow-hidden">
        <div className="p-4 border-b border-green-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-display text-sm font-semibold text-green-300">Extrato (Ledger Imutável)</h2>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <select 
              className="inp text-xs py-1 px-2" 
              value={typeFilter} 
              onChange={e=>{setTypeFilter(e.target.value); setPage(1)}}
            >
              <option value="">Todos os tipos</option>
              <option value="CREDIT">Entradas</option>
              <option value="DEBIT">Saídas</option>
              <option value="REVERSAL">Estornos</option>
            </select>
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-green-800"/>
              <input 
                type="date" 
                className="inp text-xs py-1 px-2" 
                value={startDate} 
                onChange={e=>{setStartDate(e.target.value); setPage(1)}}
                placeholder="De"
              />
              <span className="text-green-800">-</span>
              <input 
                type="date" 
                className="inp text-xs py-1 px-2" 
                value={endDate} 
                onChange={e=>{setEndDate(e.target.value); setPage(1)}}
                placeholder="Até"
              />
            </div>
            {(startDate || endDate || typeFilter) && (
              <button 
                className="text-xs text-green-800 hover:text-green-600"
                onClick={()=>{setStartDate(''); setEndDate(''); setTypeFilter(''); setPage(1)}}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile cards (< md) */}
        <div className="md:hidden divide-y divide-white/5">
          {ledger?.entries?.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-sm">Sem movimentações</p>
          )}
          {ledger?.entries?.map(e => (
            <div key={e.id} className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={e.type==='CREDIT'?'badge badge-g':e.type==='DEBIT'?'badge badge-r':'badge badge-y'}>
                    {e.type==='CREDIT'?'Entrada':e.type==='DEBIT'?'Saída':'Estorno'}
                  </span>
                  <span className="font-mono text-xs text-slate-500">{new Date(e.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-sm text-slate-200 truncate">{e.description}</p>
                {e.student?.name && <p className="text-xs text-slate-500 mt-0.5">{e.student.name}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-mono text-sm font-bold ${e.type==='CREDIT'?'money-pos':'money-neg'}`}>
                  {e.type==='CREDIT'?'+':'-'}{fmt(e.amount)}
                </span>
                {isAllowed && (
                  <div className="flex gap-1">
                    {e.type!=='REVERSAL' && <button onClick={()=>reverse(e.id)} className="text-slate-500 hover:text-yellow-400 p-1" title="Estornar"><RefreshCw size={12}/></button>}
                    {isSuperadmin && <button onClick={()=>deleteEntry(e.id)} className="text-slate-500 hover:text-red-400 p-1" title="Deletar"><Trash2 size={12}/></button>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Aluno</th><th>Valor</th>{isAllowed && <th>Ações</th>}</tr></thead>
            <tbody>
              {ledger?.entries?.map(e=>(
                <tr key={e.id}>
                  <td className="font-mono text-xs text-green-800">{new Date(e.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td><span className={e.type==='CREDIT'?'badge badge-g':e.type==='DEBIT'?'badge badge-r':'badge badge-y'}>
                    {e.type==='CREDIT'?'↑ Entrada':e.type==='DEBIT'?'↓ Saída':'↩ Estorno'}
                  </span></td>
                  <td className="text-sm max-w-xs truncate">{e.description}</td>
                  <td className="text-xs text-green-700">{e.student?.name||'—'}</td>
                  <td className={`font-mono text-sm font-semibold ${e.type==='CREDIT'?'money-pos':'money-neg'}`}>
                    {e.type==='CREDIT'?'+':'-'}{fmt(e.amount)}
                  </td>
                  {isAllowed && (
                    <td>
                      <div className="flex gap-2">
                        {e.type!=='REVERSAL' && <button onClick={()=>reverse(e.id)} className="text-green-800 hover:text-yellow-400" title="Estornar"><RefreshCw size={13}/></button>}
                        {isSuperadmin && <button onClick={()=>deleteEntry(e.id)} className="text-green-800 hover:text-red-400" title="Deletar"><Trash2 size={13}/></button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!ledger?.entries?.length && <tr><td colSpan={isAllowed ? 6 : 5} className="text-center text-green-900 py-8">Sem movimentações</td></tr>}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {ledger?.total > 0 && (
          <div className="p-4 border-t border-green-900/40 flex items-center justify-between">
            <p className="text-xs text-green-800">
              Mostrando {((page-1)*limit)+1} - {Math.min(page*limit, ledger.total)} de {ledger.total} registros
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
                disabled={page*limit >= ledger.total}
              >
                Próxima <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal only for authorized users */}
      {isAllowed && (
        <Modal open={!!modal} onClose={()=>setModal(null)} title={modal==='credit'?'📈 Nova Entrada':'📉 Nova Saída'}>
          <form onSubmit={submit} className="space-y-4">
            <div><label className="lbl">Valor (R$) *</label><input type="number" step="0.01" min="0.01" className="inp" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></div>
            <div><label className="lbl">Descrição *</label><input className="inp" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></div>
            {modal==='credit' && (
              <div><label className="lbl">Aluno (opcional)</label>
                <select className="inp" value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})}>
                  <option value="">— Nenhum —</option>
                  {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            {err && <p className="text-red-400 text-xs text-center">{err}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
              <button type="submit" className="btn-g flex-1 justify-center">Confirmar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
