// src/pages/PublicPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn, X, Users, Ticket, DollarSign } from 'lucide-react'
import axios from 'axios'
import Panther from '../components/Panther'
import ForestBg from '../components/ForestBg'
import { useAuthStore } from '../store/auth'
import api from '../lib/api'

const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`

export default function PublicPage() {
  const [info, setInfo] = useState(null)
  const [students, setStudents] = useState([])
  const [raffles, setRaffles] = useState([])
  const [loginOpen, setLoginOpen] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ username:'', password:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  // Secret: click panther 3 times
  const [clicks, setClicks] = useState(0)

  const { setAuth, isAuth } = useAuthStore()
  const nav = useNavigate()

  useEffect(() => {
    if (isAuth) { nav('/dash'); return }
    axios.get('/api/public/info').then(r => setInfo(r.data)).catch(() => {})
    axios.get('/api/public/students').then(r => setStudents(r.data)).catch(() => {})
    axios.get('/api/public/raffles').then(r => setRaffles(r.data)).catch(() => {})
  }, [isAuth])

  // Secret click on panther opens login
  const handlePantherClick = () => {
    const n = clicks + 1
    setClicks(n)
    if (n >= 3) { setLoginOpen(true); setClicks(0) }
  }

  const handleLogin = async e => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.user, data.accessToken)
      nav('/dash')
    } catch (e) {
      setErr(e.response?.data?.error || 'Erro ao entrar')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ForestBg/>

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background:'rgba(1,8,4,0.6)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(0,255,136,0.12)' }}>
        <div className="flex items-center gap-3">
          {/* Click panther 3× to open login */}
          <div onClick={handlePantherClick} className="cursor-pointer select-none">
            <Panther size={40} glow/>
          </div>
          <div>
            <p className="font-display font-bold text-green-200 leading-tight" style={{ textShadow:'0 0 18px rgba(0,255,136,0.3)' }}>
              {info?.siteName || 'Turma Pantera'}
            </p>
            <p className="text-xs text-green-800 tracking-widest uppercase">3º Ano</p>
          </div>
        </div>

        <ul className="flex items-center gap-6 list-none">
          {['Sobre','Alunos','Rifas'].map(l => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`}
                className="text-green-700 hover:text-green-300 text-sm font-semibold transition-colors">{l}</a>
            </li>
          ))}
          {/* Hidden login — small subtle icon */}
          <li>
            <button onClick={() => setLoginOpen(true)}
              className="text-green-900 hover:text-green-600 transition-colors" title="Área restrita">
              <LogIn size={16}/>
            </button>
          </li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 gap-5">
        <motion.div initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.7}}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.22)', color:'#00ff88' }}>
            🐾 Bem-vindo à nossa turma
          </span>
        </motion.div>

        <motion.h1
          initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.1}}
          className="font-display font-black text-4xl md:text-6xl text-green-100 leading-tight"
          style={{ textShadow:'0 0 40px rgba(0,255,136,0.2), 0 4px 30px rgba(0,0,0,0.8)' }}>
          Turma <span style={{ color:'#00ff88' }}>Pantera</span>
        </motion.h1>

        <motion.p
          initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.2}}
          className="max-w-lg text-green-700 text-base leading-relaxed">
          {info?.siteDescription || 'Sistema de gestão e acompanhamento do 3º Ano — rifas, arrecadações e muito mais!'}
        </motion.p>

        <motion.div
          initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.3}}
          className="flex gap-3 flex-wrap justify-center">
          <a href="#alunos" className="btn-g">Ver a Turma</a>
          <a href="#rifas" className="btn-ghost">Rifas Abertas</a>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 flex flex-wrap justify-center gap-4 px-6 pb-16">
        {[
          { icon:Users, label:'Alunos', value:info?.studentCount ?? '—', color:'#00ff88' },
          { icon:DollarSign, label:'Arrecadado', value:info ? fmt(info.totalRaised) : '—', color:'#00ccff' },
          { icon:Ticket, label:'Rifas Abertas', value:raffles.length, color:'#ffcc00' },
        ].map((s,i) => (
          <motion.div key={s.label}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.4+i*.1}}
            className="glass px-6 py-5 flex flex-col items-center gap-2 min-w-[140px]">
            <s.icon size={22} style={{ color:s.color }}/>
            <p className="font-display text-2xl font-bold" style={{ color:s.color }}>{s.value}</p>
            <p className="text-xs text-green-800 uppercase tracking-wider">{s.label}</p>
          </motion.div>
        ))}
      </section>

      {/* ── ALUNOS ── */}
      {students.length > 0 && (
        <section id="alunos" className="relative z-10 px-6 md:px-12 pb-16">
          <h2 className="stitle mb-6 text-center">Nossa Turma</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {students.map((s,i) => (
              <motion.div key={s.id}
                initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{delay:i*.04}}
                className="glass p-4 flex flex-col items-center gap-2 text-center">
                {s.photo
                  ? <img src={s.photo} alt={s.name} className="w-16 h-16 rounded-full object-cover border border-green-800"/>
                  : <div className="w-16 h-16 rounded-full bg-green-900/50 flex items-center justify-center font-display font-bold text-xl text-green-400 border border-green-800">{s.name[0]}</div>
                }
                <p className="text-sm font-semibold text-green-200 leading-tight">{s.name}</p>
                {s.description && <p className="text-xs text-green-800 line-clamp-2">{s.description}</p>}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── RIFAS ── */}
      {raffles.length > 0 && (
        <section id="rifas" className="relative z-10 px-6 md:px-12 pb-20">
          <h2 className="stitle mb-6 text-center">Rifas Abertas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {raffles.map((r,i) => (
              <motion.div key={r.id}
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.08}}
                className="glass p-5">
                {r.prizeImage && <img src={r.prizeImage} alt="Prêmio" className="w-full h-32 object-cover rounded-xl mb-3 border border-green-800"/>}
                <h3 className="font-display font-bold text-green-100 text-sm mb-1">{r.title}</h3>
                {r.description && <p className="text-xs text-green-700 mb-2">{r.description}</p>}
                <div className="flex justify-between text-xs text-green-800">
                  <span><Ticket size={10} className="inline mr-1"/>{r._count?.participants||0} participantes</span>
                  {r.drawDate && <span>📅 {new Date(r.drawDate).toLocaleDateString('pt-BR')}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="relative z-10 text-center py-4 text-xs text-green-900 border-t border-green-900/30"
        style={{ background:'rgba(1,6,3,0.5)', backdropFilter:'blur(8px)' }}>
        © {new Date().getFullYear()} Turma Pantera · 3º Ano
      </footer>

      {/* ── LOGIN MODAL ── */}
      <AnimatePresence>
        {loginOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="absolute inset-0"
              style={{ background:'rgba(0,4,2,0.82)', backdropFilter:'blur(10px)' }}
              onClick={() => setLoginOpen(false)}/>

            <motion.div
              className="relative glass p-8 w-full max-w-sm"
              initial={{scale:.78,y:30}} animate={{scale:1,y:0}}
              exit={{scale:.78,y:30}} transition={{type:'spring',damping:22}}
              style={{ boxShadow:'0 24px 60px rgba(0,0,0,0.7), 0 0 60px rgba(0,255,136,0.06)' }}
            >
              <button onClick={() => setLoginOpen(false)} className="absolute top-4 right-4 text-green-800 hover:text-green-400 transition-colors">
                <X size={18}/>
              </button>

              <div className="flex justify-center mb-4">
                <Panther size={64} glow animate/>
              </div>
              <h2 className="font-display text-xl font-bold text-green-100 text-center mb-1">Área Administrativa</h2>
              <p className="text-xs text-green-800 text-center uppercase tracking-widest mb-6">Acesso restrito</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="lbl">Usuário</label>
                  <input className="inp" placeholder="nome_de_usuario" value={form.username}
                    onChange={e => setForm({...form, username:e.target.value})} required/>
                </div>
                <div>
                  <label className="lbl">Senha</label>
                  <div className="relative">
                    <input className="inp pr-10" type={showPw?'text':'password'} placeholder="••••••••"
                      value={form.password} onChange={e => setForm({...form, password:e.target.value})} required/>
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-400">
                      {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>
                {err && <p className="text-red-400 text-xs text-center py-2 rounded-lg" style={{background:'rgba(255,60,60,0.08)'}}>{err}</p>}
                <button type="submit" disabled={loading} className="btn-g w-full justify-center text-sm">
                  {loading ? '⏳ Entrando...' : <><LogIn size={15}/> Entrar</>}
                </button>
              </form>
              <p className="text-center text-xs text-green-900 mt-4">Acesso somente para administradores</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
