// src/pages/RafflesPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Ticket, Play, Trophy } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import { useAuthStore } from '../store/auth'
import Panther from '../components/Panther'

export default function RafflesPage() {
  const [raffles, setRaffles] = useState([])
  const [students, setStudents] = useState([])
  const [modal, setModal] = useState(null)
  const [activeRaffle, setActiveRaffle] = useState(null)
  const [drawResult, setDrawResult] = useState(null)
  const [drawing, setDrawing] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', drawDate:'' })
  const [pForm, setPForm] = useState({ studentId:'', tickets:1 })
  const { isAdmin } = useAuthStore()

  const load = async () => {
    const [r,s] = await Promise.all([api.get('/raffles'), api.get('/students')])
    setRaffles(r.data); setStudents(s.data)
  }
  useEffect(()=>{ load() },[])

  const createRaffle = async e => {
    e.preventDefault()
    await api.post('/raffles', form)
    setModal(null); setForm({title:'',description:'',drawDate:''}); load()
  }

  const addParticipant = async e => {
    e.preventDefault()
    await api.post(`/raffles/${activeRaffle}/participants`, { ...pForm, tickets:parseInt(pForm.tickets) })
    setModal(null); setPForm({studentId:'',tickets:1}); load()
  }

  const draw = async id => {
    if (!confirm('Realizar o sorteio? Esta ação é irreversível!')) return
    setDrawing(true)
    try {
      const raffle = raffles.find(r=>r.id===id)
      const { data } = await api.post(`/raffles/${id}/draw`)
      setDrawResult({ ...data, raffleTitle:raffle?.title })
      load()
    } catch(e) { alert(e.response?.data?.error||'Erro') }
    finally { setDrawing(false) }
  }

  const statusBadge = { OPEN:'badge-g', CLOSED:'badge-r', CANCELLED:'badge-y' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="stitle">Rifas</h1>
        {isAdmin() && <button className="btn-g" onClick={()=>setModal('create')}><Plus size={15}/>Nova Rifa</button>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {raffles.map((r,i) => (
          <motion.div key={r.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.07}} className="glass p-5 flex flex-col gap-3">
            {r.prizeImage && <img src={r.prizeImage} className="w-full h-28 object-cover rounded-xl border border-green-900" alt="Prêmio"/>}
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-display font-bold text-green-100 text-sm">{r.title}</h3>
              <span className={`badge ${statusBadge[r.status]}`}>{r.status==='OPEN'?'Aberta':r.status==='CLOSED'?'Encerrada':'Cancelada'}</span>
            </div>
            {r.description && <p className="text-xs text-green-800">{r.description}</p>}
            <div className="text-xs text-green-800 flex gap-3">
              <span><Ticket size={10} className="inline mr-1"/>{r.participants.length} participantes</span>
              {r.drawDate && <span>📅 {new Date(r.drawDate).toLocaleDateString('pt-BR')}</span>}
            </div>
            {r.draw?.winner && (
              <div className="p-3 rounded-xl text-center" style={{background:'rgba(255,200,0,0.08)',border:'1px solid rgba(255,200,0,0.2)'}}>
                <Trophy size={12} className="text-yellow-400 mx-auto mb-1"/>
                <p className="text-xs text-yellow-300 font-semibold">🏆 {r.draw.winner.name}</p>
                <p className="font-mono text-xs text-green-900 mt-1 break-all">#{r.draw.hash.slice(0,20)}...</p>
              </div>
            )}
            {isAdmin() && r.status==='OPEN' && (
              <div className="flex gap-2">
                <button className="btn-g flex-1 justify-center text-xs" onClick={()=>{setActiveRaffle(r.id);setModal('participant')}}>
                  <Plus size={12}/>Participante
                </button>
                <button
                  className="text-xs px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1"
                  style={{background:'linear-gradient(135deg,#4d1a00,#803000)',border:'1px solid rgba(255,120,0,0.3)',color:'#ffa060'}}
                  onClick={()=>draw(r.id)} disabled={drawing||!r.participants.length}>
                  <Play size={12}/>Sortear
                </button>
              </div>
            )}
          </motion.div>
        ))}
        {!raffles.length && <div className="col-span-3 text-center text-green-900 py-12">Nenhuma rifa criada</div>}
      </div>

      <Modal open={modal==='create'} onClose={()=>setModal(null)} title="🎟️ Nova Rifa">
        <form onSubmit={createRaffle} className="space-y-4">
          <div><label className="lbl">Título *</label><input className="inp" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></div>
          <div><label className="lbl">Descrição</label><textarea className="inp" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div><label className="lbl">Data do Sorteio</label><input type="date" className="inp" value={form.drawDate} onChange={e=>setForm({...form,drawDate:e.target.value})}/></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Criar</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal==='participant'} onClose={()=>setModal(null)} title="➕ Adicionar Participante">
        <form onSubmit={addParticipant} className="space-y-4">
          <div><label className="lbl">Aluno *</label>
            <select className="inp" value={pForm.studentId} onChange={e=>setPForm({...pForm,studentId:e.target.value})} required>
              <option value="">Selecionar...</option>
              {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="lbl">Tickets</label><input type="number" min="1" className="inp" value={pForm.tickets} onChange={e=>setPForm({...pForm,tickets:e.target.value})}/></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Adicionar</button>
          </div>
        </form>
      </Modal>

      {/* Cinematic draw result */}
      <AnimatePresence>
        {drawResult && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <div className="absolute inset-0" style={{background:'rgba(0,5,2,0.92)',backdropFilter:'blur(10px)'}}/>
            <motion.div className="relative glass p-8 w-full max-w-sm text-center"
              initial={{scale:.3,rotate:-8}} animate={{scale:1,rotate:0}}
              transition={{type:'spring',damping:14}}
              style={{borderColor:'rgba(255,204,0,0.45)',boxShadow:'0 0 70px rgba(255,204,0,0.2)'}}>
              {[...Array(14)].map((_,i) => (
                <motion.div key={i} className="absolute w-2 h-2 rounded-full" style={{top:'50%',left:'50%',background:i%2?'#ffcc00':'#00ff88'}}
                  animate={{x:Math.cos(i/14*Math.PI*2)*160, y:Math.sin(i/14*Math.PI*2)*160, opacity:[1,0], scale:[1,0]}}
                  transition={{duration:1.5,delay:.2}}/>
              ))}
              <motion.div className="text-5xl mb-4" animate={{rotate:[0,360]}} transition={{duration:1}}>🏆</motion.div>
              <p className="text-yellow-400 font-display text-xs uppercase tracking-widest mb-1">Vencedor</p>
              <p className="font-display text-2xl font-bold text-yellow-300 mb-4">{drawResult.raffleTitle}</p>
              <div className="my-4 flex justify-center"><Panther size={55} glow/></div>
              <p className="text-green-200 text-lg font-semibold mb-4">{drawResult.draw?.winner?.name}</p>
              <div className="text-left p-3 rounded-xl text-xs font-mono" style={{background:'rgba(0,0,0,0.5)',border:'1px solid rgba(0,255,136,0.15)'}}>
                <p className="text-green-800 mb-1">Hash SHA256 (auditável):</p>
                <p className="text-green-400 break-all">{drawResult.hash}</p>
              </div>
              <motion.button className="btn-g mt-6 px-10 justify-center" onClick={()=>setDrawResult(null)} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}}>
                Fechar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
