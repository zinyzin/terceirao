// src/pages/FinancePage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, RefreshCw, Download, Trash2 } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import axios from 'axios'
import { useAuthStore } from '../store/auth'

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

  const isAllowed = isAuth && can('finance:detail')
  const isSuperadmin = user?.role === 'SUPERADMIN'

  const load = async () => {
    if (!isAllowed) {
      const { data } = await axios.get('/api/public/finance')
      setPublicData(data)
      return
    }
    const [w,l,s] = await Promise.all([api.get('/finance/wallet'), api.get('/finance/ledger'), api.get('/students')])
    setWallet(w.data); setLedger(l.data); setStudents(s.data)
  }

  useEffect(()=>{ load() },[isAllowed])

  const submit = async e => {
    e.preventDefault(); setErr('')
    try {
      await api.post(`/finance/${modal}`, { ...form, amount:parseFloat(form.amount) })
      setModal(null); setForm({amount:'',description:'',studentId:''}); load()
    } catch(e) { setErr(e.response?.data?.error||'Erro') }
  }

  const reverse = async id => {
    if (!confirm('Confirmar estorno?')) return
    await api.post(`/finance/reverse/${id}`); load()
  }

  const deleteEntry = async id => {
    if (!confirm('ATENÇÃO: Deletar esta transação permanentemente?')) return
    await api.delete(`/finance/ledger/${id}`); load()
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

      {!isAllowed && (
        <div className="glass p-5">
          <p className="text-xs text-green-800 uppercase tracking-wider mb-3">Termômetro da Formatura</p>
          <div className="w-full h-4 rounded-full" style={{ background:'rgba(0,255,136,0.10)', border:'1px solid rgba(0,255,136,0.16)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round((publicData?.progress ?? 0) * 100)}%`,
                background: 'linear-gradient(90deg,#00ff88,#00ccff)',
                boxShadow: '0 0 16px rgba(0,255,136,0.25)',
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-3">
            <span className="text-green-800">Arrecadado</span>
            <span className="money-pos font-mono font-bold">{fmt(publicData?.raised)}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-green-800">Meta</span>
            <span className="text-green-500 font-mono font-bold">{fmt(publicData?.goalAmount)}</span>
          </div>
          <p className="text-xs text-green-900 mt-4">Para ver o fluxo de caixa completo, é necessário acesso de Admin autorizado.</p>
        </div>
      )}

      {isAllowed && (
        <>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {l:'Saldo Atual', v:fmt(wallet?.balance), c:'#00ff88'},
          {l:'Total Entradas', v:fmt(wallet?.balance>=0?undefined:0), c:'#00ccff'},
          {l:'Registros', v:ledger.total, c:'#ffcc00'},
        ].map((s,i)=>(
          <motion.div key={s.l} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.08}} className="glass p-5">
            <p className="text-xs text-green-800 uppercase tracking-wider mb-2">{s.l}</p>
            <p className="font-display text-2xl font-bold" style={{color:s.c}}>{s.v}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass overflow-hidden">
        <div className="p-4 border-b border-green-900/40">
          <h2 className="font-display text-sm font-semibold text-green-300">Extrato (Ledger Imutável)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Aluno</th><th>Valor</th><th>Ações</th></tr></thead>
            <tbody>
              {ledger.entries.map(e=>(
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
                  <td>
                    <div className="flex gap-2">
                      {e.type!=='REVERSAL' && (
                        <button onClick={()=>reverse(e.id)} className="text-green-800 hover:text-yellow-400 transition-colors" title="Estornar"><RefreshCw size={13}/></button>
                      )}
                      {isSuperadmin && (
                        <button onClick={()=>deleteEntry(e.id)} className="text-green-800 hover:text-red-400 transition-colors" title="Deletar"><Trash2 size={13}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!ledger.entries.length && <tr><td colSpan={6} className="text-center text-green-900 py-8">Sem movimentações</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

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
        </>
      )}
    </div>
  )
}
