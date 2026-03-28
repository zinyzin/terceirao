// src/pages/TeachersPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Search, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import ForestBg from '../components/ForestBg'
import { useAuthStore } from '../store/auth'
import api from '../lib/api'
import axios from 'axios'

export default function TeachersPage() {
  const { isAuth, can } = useAuthStore()
  const isAllowed = isAuth && can('teachers:edit')

  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', subject:'', shortDescription:'', longDescription:'', catchphrase:'' })
  const [photo, setPhoto] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      if (!isAllowed) {
        const { data } = await axios.get('/api/public/teachers')
        setTeachers(data)
        return
      }
      const { data } = await api.get('/teachers')
      setTeachers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [isAllowed])

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  const handleSubmit = async e => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('subject', form.subject)
    fd.append('shortDescription', form.shortDescription)
    fd.append('longDescription', form.longDescription)
    fd.append('catchphrase', form.catchphrase)
    if (photo) fd.append('photo', photo)
    if (editing) await api.put(`/teachers/${editing.id}`, fd, { headers:{'Content-Type':'multipart/form-data'} })
    else await api.post('/teachers', fd, { headers:{'Content-Type':'multipart/form-data'} })
    setModal(null); setEditing(null); setForm({name:'',subject:'',shortDescription:'',longDescription:'',catchphrase:''}); setPhoto(null); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este professor?')) return
    try {
      await api.delete(`/teachers/${id}`)
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao excluir')
    }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ForestBg/>

      <main className="page-shell pt-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="stitle">Professores</h1>
            {isAllowed && <button className="btn-g" onClick={()=>{setEditing(null);setForm({name:'',subject:'',shortDescription:'',longDescription:'',catchphrase:''});setPhoto(null);setModal('form')}}><Plus size={15}/>Novo Professor</button>}
          </div>

          {isAllowed && (
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input className="inp pl-9" placeholder="Buscar professor..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_,i)=><div key={i} className="skel h-40 rounded-2xl"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t, i) => {
              const isExpanded = expandedId === t.id
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  layout
                  style={t.isCounselor ? { borderColor: 'rgba(255,204,0,0.35)', boxShadow: '0 14px 40px rgba(0,0,0,0.55), 0 0 26px rgba(255,204,0,0.08)' } : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-blue-50 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-300 mt-1">Matéria: <span className="text-sky-300">{t.subject || '—'}</span></p>
                      {t.isCounselor && <p className="text-xs text-yellow-400 mt-1 font-semibold">⭐ Professor Conselheiro</p>}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-900/50 border border-blue-300/20 flex items-center justify-center text-blue-300 font-display font-black flex-shrink-0">
                      {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full rounded-xl object-cover"/> : t.name[0]}
                    </div>
                  </div>
                  {!isExpanded && <p className="text-xs text-slate-300 mt-3 line-clamp-3">{t.shortDescription || t.longDescription || '—'}</p>}
                  {isExpanded && (
                    <motion.div
                      initial={{opacity:0,height:0}}
                      animate={{opacity:1,height:'auto'}}
                      exit={{opacity:0,height:0}}
                      transition={{duration:0.3}}
                      className="mt-3 space-y-3"
                    >
                      {t.catchphrase && (
                        <div className="p-3 rounded-lg surface-muted">
                          <p className="text-xs text-sky-200/70 uppercase tracking-wider mb-1">Bordão</p>
                          <p className="text-xs text-blue-100 italic">"{t.catchphrase}"</p>
                        </div>
                      )}
                      {t.longDescription && <p className="text-xs text-slate-300 whitespace-pre-line">{t.longDescription}</p>}
                      {isAllowed && (
                        <button
                          className="btn-ghost text-xs w-full justify-center"
                          onClick={(e)=>{e.stopPropagation();setSelected(t);setModal('detail')}}
                        >
                          Editar Professor
                        </button>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
            </div>
          )}

          <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="">
            {selected && (
              <div>
                <div className="flex justify-center mb-4">
                  {selected.photo
                    ? <img src={selected.photo} className="w-40 h-40 rounded-2xl object-cover border border-blue-300/30"/>
                    : <div className="w-40 h-40 rounded-2xl bg-slate-900/50 flex items-center justify-center font-display text-5xl font-bold text-blue-300">{selected.name[0]}</div>
                  }
                </div>

                <h2 className="font-display text-xl font-bold text-blue-50 text-center">{selected.name}</h2>
                <p className="text-xs text-slate-300 text-center mt-2">Matéria: <span className="text-sky-300">{selected.subject || '—'}</span></p>
                {selected.isCounselor && <p className="text-xs text-yellow-400 text-center mt-1 font-semibold">⭐ Professor Conselheiro</p>}

                {selected.catchphrase && (
                  <div className="mt-5 p-4 rounded-xl surface-muted">
                    <p className="text-xs text-sky-200/70 uppercase tracking-wider mb-2">Bordão</p>
                    <p className="text-sm text-blue-100">"{selected.catchphrase}"</p>
                  </div>
                )}

                {selected.longDescription && <p className="text-slate-300 text-sm mt-4 whitespace-pre-line">{selected.longDescription}</p>}

                {isAllowed && (
                  <button className="btn-g w-full justify-center mt-5" onClick={()=>{setEditing(selected);setForm({name:selected.name,subject:selected.subject||'',shortDescription:selected.shortDescription||'',longDescription:selected.longDescription||'',catchphrase:selected.catchphrase||''});setModal('form')}}>
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

          <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editing?'Editar Professor':'Novo Professor'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="lbl">Nome *</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
              <div><label className="lbl">Matéria</label><input className="inp" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></div>
              <div><label className="lbl">Descrição Curta</label><textarea className="inp" rows={2} value={form.shortDescription} onChange={e=>setForm({...form,shortDescription:e.target.value})}/></div>
              <div><label className="lbl">Biografia Completa</label><textarea className="inp" rows={4} value={form.longDescription} onChange={e=>setForm({...form,longDescription:e.target.value})}/></div>
              <div><label className="lbl">Bordão</label><input className="inp" value={form.catchphrase} onChange={e=>setForm({...form,catchphrase:e.target.value})}/></div>
              <div><label className="lbl">Foto</label><input type="file" accept="image/*" className="inp" onChange={e=>setPhoto(e.target.files[0])}/></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-g flex-1 justify-center">Salvar</button>
              </div>
            </form>
          </Modal>
        </div>
      </main>
    </div>
  )
}
