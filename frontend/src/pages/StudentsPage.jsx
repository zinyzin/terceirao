// src/pages/StudentsPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import { useAuthStore } from '../store/auth'
import { toast } from '../components/Toast'
import { confirm } from '../components/ConfirmModal'
import axios from 'axios'

const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', shortDescription:'', longDescription:'' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [photo, setPhoto] = useState(null)
  const { isAuth, can } = useAuthStore()

  const isAllowed = isAuth && can('students:manage')

  const load = async () => {
    setLoading(true)
    try {
      if (!isAllowed) {
        const { data } = await axios.get('/api/public/students')
        setStudents(data)
        return
      }
      const { data } = await api.get('/students')
      setStudents(data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ load() },[isAllowed])

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nome é obrigatório'
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('shortDescription', form.shortDescription)
      fd.append('longDescription', form.longDescription)
      if (photo) fd.append('photo', photo)
      if (editing) await api.put(`/students/${editing.id}`, fd, { headers:{'Content-Type':'multipart/form-data'} })
      else await api.post('/students', fd, { headers:{'Content-Type':'multipart/form-data'} })
      setModal(null); setEditing(null); setForm({name:'',shortDescription:'',longDescription:''}); setPhoto(null); setFieldErrors({}); load()
      toast.success(editing ? 'Aluno atualizado!' : 'Aluno criado!')
    } catch (e) {
      console.error('Erro ao salvar:', e)
      toast.error(e.response?.data?.error || e.message || 'Erro ao salvar aluno')
    }
  }

  const handleDelete = async (id) => {
    if (!await confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.', 'Excluir Aluno')) return
    try {
      await api.delete(`/students/${id}`)
      toast.success('Aluno excluído.')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao excluir aluno')
    }
  }

  const engColor = score => score>50?'#00ff88':score>20?'#66cc88':score>5?'#ffcc00':'#ff7070'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="stitle">Alunos</h1>
        {isAllowed && <button className="btn-g" onClick={()=>{setEditing(null);setForm({name:'',shortDescription:'',longDescription:''});setPhoto(null);setModal('form')}}><Plus size={15}/>Novo Aluno</button>}
      </div>

      <div className="relative max-w-xs w-full">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input className="inp pl-9" placeholder="Buscar aluno..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {loading
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><div key={i} className="skel h-36 rounded-2xl"/>)}</div>
        : filtered.length === 0
          ? (
            <div className="glass p-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:'rgba(96,165,250,0.08)',border:'1px solid rgba(96,165,250,0.15)'}}>
                <Users size={24} className="text-blue-400/50"/>
              </div>
              <p className="font-display text-blue-100/60 font-semibold">{search ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}</p>
              <p className="text-xs text-slate-500">{search ? 'Tente outro termo de busca' : isAllowed ? 'Clique em "Novo Aluno" para começar' : 'Os alunos aparecerão aqui em breve'}</p>
            </div>
          )
          : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s, i) => {
              const isExpanded = expandedId === s.id
              const eng = s.totalDonated*0.5+(s.totalTickets||0)*2+(s.wins||0)*10
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity:0, y:16 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass glass-card p-5"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  layout
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-blue-50 text-sm">{s.name}</p>
                      {isAllowed && (
                        <div className="flex gap-3 mt-1 text-xs">
                          <span className="money-pos font-mono">{fmt(s.totalDonated)}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-sky-300">{s.totalTickets} tickets</span>
                        </div>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-900/50 border border-blue-300/20 flex items-center justify-center text-blue-300 font-display font-black flex-shrink-0">
                      {s.photo
                        ? <img src={s.photo} alt={s.name} className="w-full h-full rounded-xl object-cover"/>
                        : s.name[0]
                      }
                    </div>
                  </div>

                  {!isExpanded && <p className="text-xs text-slate-300 mt-3 line-clamp-3">{s.shortDescription || s.longDescription || '—'}</p>}

                  {isExpanded && (
                    <motion.div
                      initial={{opacity:0,height:0}}
                      animate={{opacity:1,height:'auto'}}
                      exit={{opacity:0,height:0}}
                      transition={{duration:0.3}}
                      className="mt-3 space-y-3"
                    >
                      {s.longDescription && <p className="text-xs text-slate-300 whitespace-pre-line">{s.longDescription}</p>}
                      {isAllowed && (
                        <button
                          className="btn-ghost text-xs w-full justify-center"
                          onClick={(e)=>{e.stopPropagation();setSelected(s);setModal('detail')}}
                        >
                          Editar Aluno
                        </button>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )
      }

      {/* Detail modal */}
      <Modal open={modal==='detail'} onClose={()=>setModal(null)} title="">
        {selected && (
          <div>
            <div className="flex justify-center mb-4">
              {selected.photo
                ? <img src={selected.photo} className="w-40 h-40 rounded-2xl object-cover border border-blue-300/30"/>
                : <div className="w-40 h-40 rounded-2xl bg-slate-900/50 flex items-center justify-center font-display text-5xl font-bold text-blue-300">{selected.name[0]}</div>
              }
            </div>
            <h2 className="font-display text-xl font-bold text-blue-50 text-center">{selected.name}</h2>

            {selected.shortDescription && (
              <p className="text-slate-300 text-sm text-center mt-2">{selected.shortDescription}</p>
            )}

            {isAllowed && (
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[{l:'Ranking',v:`#${selected.rank}`,c:'#ffcc00'},{l:'Contribuído',v:fmt(selected.totalDonated),c:'#00ff88'},{l:'Vitórias',v:selected.wins,c:'#ff9900'}].map(x=>(
                  <div key={x.l} className="text-center p-3 rounded-xl surface-muted">
                    <p className="text-xs text-slate-400 mb-1">{x.l}</p>
                    <p className="font-mono font-bold text-sm" style={{color:x.c}}>{x.v}</p>
                  </div>
                ))}
              </div>
            )}

            {selected.longDescription && (
              <p className="text-slate-300 text-sm mt-4 whitespace-pre-line">{selected.longDescription}</p>
            )}

            {isAllowed && (
              <button className="btn-g w-full justify-center mt-5" onClick={()=>{setEditing(selected);setForm({name:selected.name,shortDescription:selected.shortDescription||'',longDescription:selected.longDescription||''});setModal('form')}}>
                <Edit2 size={14}/> Editar
              </button>
            )}
            {isAllowed && (
              <button className="btn-danger w-full justify-center mt-2" onClick={()=>{handleDelete(selected.id);setModal(null)}}>
                <Trash2 size={14}/> Excluir
              </button>
            )}
            <button className="btn-ghost w-full justify-center mt-2" onClick={()=>setModal(null)}>
              Fechar
            </button>
          </div>
        )}
      </Modal>

      {/* Form modal */}
      <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editing?'Editar Aluno':'Novo Aluno'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="lbl">Nome *</label>
            <input
              className={`inp ${fieldErrors.name ? 'border-red-500/60 focus:border-red-500' : ''}`}
              value={form.name}
              onChange={e=>{setForm({...form,name:e.target.value});setFieldErrors(p=>({...p,name:undefined}))}}
            />
            {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
          </div>
          <div><label className="lbl">Descrição Curta</label><textarea className="inp" rows={2} placeholder="Frase de apresentação..." value={form.shortDescription} onChange={e=>setForm({...form,shortDescription:e.target.value})}/></div>
          <div><label className="lbl">Biografia Completa</label><textarea className="inp" rows={4} placeholder="Conte mais sobre o aluno..." value={form.longDescription} onChange={e=>setForm({...form,longDescription:e.target.value})}/></div>
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
