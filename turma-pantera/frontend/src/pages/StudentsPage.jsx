// src/pages/StudentsPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Edit2, Trophy, Ticket, Star } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import { useAuthStore } from '../store/auth'

const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // 'create'|'edit'|'detail'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', description:'' })
  const [photo, setPhoto] = useState(null)
  const { isAdmin } = useAuthStore()

  const load = () => api.get('/students').then(r => setStudents(r.data)).finally(()=>setLoading(false))
  useEffect(()=>{ load() },[])

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  const handleSubmit = async e => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('description', form.description)
    if (photo) fd.append('photo', photo)
    if (editing) await api.put(`/students/${editing.id}`, fd, { headers:{'Content-Type':'multipart/form-data'} })
    else await api.post('/students', fd, { headers:{'Content-Type':'multipart/form-data'} })
    setModal(null); setEditing(null); setForm({name:'',description:''}); setPhoto(null); load()
  }

  const engColor = score => score>50?'#00ff88':score>20?'#66cc88':score>5?'#ffcc00':'#ff7070'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="stitle">Alunos</h1>
        {isAdmin() && <button className="btn-g" onClick={()=>{setEditing(null);setForm({name:'',description:''});setPhoto(null);setModal('form')}}><Plus size={15}/>Novo Aluno</button>}
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800"/>
        <input className="inp pl-9" placeholder="Buscar aluno..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {loading
        ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{[...Array(8)].map((_,i)=><div key={i} className="skel h-52 rounded-2xl"/>)}</div>
        : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((s,i) => {
                const eng = s.totalDonated*0.5+(s.totalTickets||0)*2+(s.wins||0)*10
                return (
                  <motion.div key={s.id}
                    initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} transition={{delay:i*.04}}
                    className="glass p-4 cursor-pointer flex flex-col gap-3"
                    onClick={()=>{setSelected(s);setModal('detail')}}
                    whileHover={{scale:1.03,y:-3}}>
                    <div className="flex justify-between items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.rank===1?'r1':s.rank===2?'r2':s.rank===3?'r3':'rx'}`}>{s.rank}</div>
                      <div className="text-xs font-bold" style={{color:engColor(eng)}}>{eng>50?'🔥':eng>20?'⚡':eng>5?'✨':'💤'}</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {s.photo
                        ? <img src={s.photo} alt={s.name} className="w-16 h-16 rounded-full object-cover border-2" style={{borderColor:engColor(eng)+'60'}}/>
                        : <div className="w-16 h-16 rounded-full bg-green-900/50 border-2 flex items-center justify-center font-display text-xl font-bold text-green-400" style={{borderColor:engColor(eng)+'40'}}>{s.name[0]}</div>
                      }
                      <p className="font-display text-xs font-bold text-green-100 text-center leading-tight">{s.name}</p>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-xs"><span className="text-green-800">Contribuído</span><span className="money-pos font-mono">{fmt(s.totalDonated)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-green-800">Tickets</span><span className="text-green-500">{s.totalTickets}</span></div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )
      }

      {/* Detail modal */}
      <Modal open={modal==='detail'} onClose={()=>setModal(null)} title="">
        {selected && (
          <div>
            <div className="flex justify-center mb-4">
              {selected.photo
                ? <img src={selected.photo} className="w-28 h-28 rounded-full object-cover border-2 border-green-500/30"/>
                : <div className="w-28 h-28 rounded-full bg-green-900/50 flex items-center justify-center font-display text-4xl font-bold text-green-400">{selected.name[0]}</div>
              }
            </div>
            <h2 className="font-display text-xl font-bold text-green-100 text-center">{selected.name}</h2>
            {selected.description && <p className="text-green-700 text-sm text-center mt-2">{selected.description}</p>}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[{l:'Ranking',v:`#${selected.rank}`,c:'#ffcc00'},{l:'Contribuído',v:fmt(selected.totalDonated),c:'#00ff88'},{l:'Vitórias',v:selected.wins,c:'#ff9900'}].map(x=>(
                <div key={x.l} className="text-center p-3 rounded-xl" style={{background:'rgba(4,20,8,0.6)'}}>
                  <p className="text-xs text-green-800 mb-1">{x.l}</p>
                  <p className="font-mono font-bold text-sm" style={{color:x.c}}>{x.v}</p>
                </div>
              ))}
            </div>
            {isAdmin() && (
              <button className="btn-g w-full justify-center mt-5" onClick={()=>{setEditing(selected);setForm({name:selected.name,description:selected.description||''});setModal('form')}}>
                <Edit2 size={14}/> Editar
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Form modal */}
      <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editing?'Editar Aluno':'Novo Aluno'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="lbl">Nome *</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
          <div><label className="lbl">Descrição</label><textarea className="inp" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div><label className="lbl">Foto</label><input type="file" accept="image/*" className="inp" onChange={e=>setPhoto(e.target.files[0])}/></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
