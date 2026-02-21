// src/pages/DashPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, Ticket, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../lib/api'
import { useAuthStore } from '../store/auth'

const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`

export default function DashPage() {
  const [data, setData] = useState(null)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return (
    <div className="space-y-6">
      <div className="skel h-8 w-56 rounded"/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i)=><div key={i} className="skel h-32 rounded-2xl"/>)}
      </div>
    </div>
  )

  const cards = [
    { label:'Saldo', value:fmt(data.stats.balance), icon:DollarSign, color:'#00ff88' },
    { label:'Alunos', value:data.stats.students, icon:Users, color:'#00ccff' },
    { label:'Rifas Abertas', value:data.stats.openRaffles, icon:Ticket, color:'#ffcc00' },
    { label:'Total Entradas', value:fmt(data.stats.totalCredits), icon:TrendingUp, color:'#aa88ff' },
  ]

  return (
    <div className="space-y-7">
      <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}>
        <h1 className="stitle">Dashboard</h1>
        <p className="text-green-800 text-sm mt-1">Olá, <span className="text-green-500">{user?.name}</span> 🐾</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c,i) => (
          <motion.div key={c.label}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.08}}
            className="glass p-5 flex flex-col gap-3"
            style={{ borderColor:`${c.color}28` }}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-green-800">{c.label}</span>
              <c.icon size={16} style={{ color:c.color }}/>
            </div>
            <p className="font-display text-2xl font-bold" style={{ color:c.color }}>{c.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Monthly chart */}
        <motion.div className="glass p-5 lg:col-span-2"
          initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{delay:.35}}>
          <h2 className="font-display text-sm font-semibold text-green-300 mb-4">Movimentação Mensal</h2>
          {data.monthly.length === 0
            ? <div className="h-40 flex items-center justify-center text-green-900 text-sm">Sem dados ainda</div>
            : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data.monthly}>
                  <defs>
                    <linearGradient id="cr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.28}/>
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="db" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6060" stopOpacity={0.28}/>
                      <stop offset="95%" stopColor="#ff6060" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.08)"/>
                  <XAxis dataKey="month" tick={{ fill:'#3a7a50', fontSize:11 }}/>
                  <YAxis tick={{ fill:'#3a7a50', fontSize:11 }}/>
                  <Tooltip contentStyle={{ background:'rgba(3,18,8,0.95)', border:'1px solid rgba(0,255,136,0.25)', borderRadius:'10px', color:'#e4f5eb' }} formatter={v => fmt(v)}/>
                  <Area type="monotone" dataKey="credits" stroke="#00ff88" strokeWidth={2} fill="url(#cr)" name="Entradas"/>
                  <Area type="monotone" dataKey="debits" stroke="#ff6060" strokeWidth={2} fill="url(#db)" name="Saídas"/>
                </AreaChart>
              </ResponsiveContainer>
            )}
        </motion.div>

        {/* Top students */}
        <motion.div className="glass p-5"
          initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{delay:.45}}>
          <h2 className="font-display text-sm font-semibold text-green-300 mb-4">Top Contribuintes</h2>
          <div className="space-y-3">
            {data.topStudents.map((s,i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i===0?'r1':i===1?'r2':i===2?'r3':'rx'}`}>{i+1}</div>
                {s.photo
                  ? <img src={s.photo} className="w-8 h-8 rounded-full object-cover border border-green-800" alt={s.name}/>
                  : <div className="w-8 h-8 rounded-full bg-green-900/50 border border-green-800 flex items-center justify-center text-xs font-bold text-green-400">{s.name[0]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-200 truncate">{s.name}</p>
                  <p className="text-xs money-pos font-mono">{fmt(s.total)}</p>
                </div>
              </div>
            ))}
            {!data.topStudents.length && <p className="text-green-900 text-sm text-center py-4">Sem dados</p>}
          </div>
        </motion.div>
      </div>

      {/* Recent ledger */}
      <motion.div className="glass p-5"
        initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{delay:.55}}>
        <h2 className="font-display text-sm font-semibold text-green-300 mb-4">Movimentações Recentes</h2>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Valor</th></tr></thead>
            <tbody>
              {data.recentLedger.map(e => (
                <tr key={e.id}>
                  <td className="font-mono text-xs text-green-800">{new Date(e.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td><span className={e.type==='CREDIT'?'badge badge-g':e.type==='DEBIT'?'badge badge-r':'badge badge-y'}>
                    {e.type==='CREDIT'?'Entrada':e.type==='DEBIT'?'Saída':'Estorno'}
                  </span></td>
                  <td className="text-sm">{e.description}</td>
                  <td className={`font-mono text-sm font-semibold ${e.type==='CREDIT'?'money-pos':'money-neg'}`}>
                    {e.type==='CREDIT'?'+':'-'}{fmt(e.amount)}
                  </td>
                </tr>
              ))}
              {!data.recentLedger.length && <tr><td colSpan={4} className="text-center text-green-900 py-6">Sem movimentações</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
