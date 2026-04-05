// src/pages/TeachersPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Search, Trash2, Crown, GraduationCap, Palette } from 'lucide-react'
import Modal from '../components/Modal'
import { useAuthStore } from '../store/auth'
import { toast } from '../components/Toast'
import { confirm } from '../components/ConfirmModal'
import api from '../lib/api'
import axios from 'axios'

export default function TeachersPage() {
  const { isAuth, can, isSA } = useAuthStore()
  const isAllowed = isAuth && can('teachers:edit')
  const isSuperadmin = isSA()

  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', subject:'', shortDescription:'', longDescription:'', catchphrase:'' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [photo, setPhoto] = useState(null)
  const [counselorColor, setCounselorColor] = useState('#ffd700')

  const PRESET_COLORS = [
    '#ffd700', '#ff6b6b', '#48bb78', '#4299e1', '#ed64a6',
    '#ecc94b', '#38b2ac', '#9f7aea', '#ed8936', '#667eea',
  ]

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
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao carregar professores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [isAllowed])

  const setCounselor = async (id, color) => {
    try {
      await api.patch(`/teachers/${id}/counselor`, { color: color || counselorColor })
      toast.success('Professor Conselheiro definido!')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao definir conselheiro')
    }
  }

  const updateCounselorColor = async (id, color) => {
    try {
      await api.patch(`/teachers/${id}/counselor-color`, { color })
      setCounselorColor(color)
      toast.success('Cor atualizada!')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao atualizar cor')
    }
  }

  const counselor = teachers.find(t => t.isCounselor)
  const cColor = counselor?.counselorColor || '#ffd700'
  const filtered = teachers.filter(t => !t.isCounselor && t.name.toLowerCase().includes(search.toLowerCase()))

  // Sync counselorColor state when counselor loads
  useEffect(() => { if (counselor?.counselorColor) setCounselorColor(counselor.counselorColor) }, [counselor?.counselorColor])

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nome é obrigatório'
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('subject', form.subject)
      fd.append('shortDescription', form.shortDescription)
      fd.append('longDescription', form.longDescription)
      fd.append('catchphrase', form.catchphrase)
      if (photo) fd.append('photo', photo)
      if (editing) await api.put(`/teachers/${editing.id}`, fd, { headers:{'Content-Type':'multipart/form-data'} })
      else await api.post('/teachers', fd, { headers:{'Content-Type':'multipart/form-data'} })
      setModal(null); setEditing(null); setForm({name:'',subject:'',shortDescription:'',longDescription:'',catchphrase:''}); setPhoto(null); setFieldErrors({}); load()
      toast.success(editing ? 'Professor atualizado!' : 'Professor criado!')
    } catch (e) {
      console.error('Erro ao salvar:', e)
      toast.error(e.response?.data?.error || e.message || 'Erro ao salvar professor')
    }
  }

  const handleDelete = async (id) => {
    if (!await confirm('Tem certeza que deseja excluir este professor?', 'Excluir Professor')) return
    try {
      await api.delete(`/teachers/${id}`)
      toast.success('Professor excluído.')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao excluir professor')
    }
  }

  return (
    <div className="space-y-6">
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

          {/* Counselor pedestal */}
          {!loading && counselor && (
            <motion.div
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              className="relative overflow-hidden rounded-2xl p-6 sm:p-8 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${cColor}12 0%, rgba(10,8,2,0.9) 100%)`,
                border: `1px solid ${cColor}66`,
                boxShadow: `0 0 60px ${cColor}1a, 0 20px 60px rgba(0,0,0,0.6)`
              }}
              onClick={() => { setSelected(counselor); setModal('detail') }}
            >
              {/* Shimmer accent */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${cColor}14 0%, transparent 70%)` }}/>

              <div className="relative flex flex-col items-center text-center gap-4">
                {/* Crown */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ color: cColor }}
                >
                  <Crown size={32} fill="currentColor"/>
                </motion.div>

                {/* Photo */}
                <div className="relative">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2"
                    style={{ borderColor: `${cColor}80`, boxShadow: `0 0 30px ${cColor}40` }}>
                    {counselor.photo
                      ? <img src={counselor.photo} alt={counselor.name} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full bg-slate-900/50 flex items-center justify-center font-display text-4xl font-bold" style={{color: cColor}}>{counselor.name[0]}</div>
                    }
                  </div>
                </div>

                {/* Badge + Name */}
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full"
                    style={{ color: cColor, background: `${cColor}18`, border: `1px solid ${cColor}40` }}>
                    Professor Conselheiro
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-blue-50">{counselor.name}</h2>
                  {counselor.subject && <p className="text-sm text-slate-400">Matéria: {counselor.subject}</p>}
                </div>

                {/* Catchphrase */}
                {counselor.catchphrase && (
                  <div className="max-w-lg">
                    <p className="text-base sm:text-lg text-slate-200/90 italic font-medium leading-relaxed">
                      "{counselor.catchphrase}"
                    </p>
                  </div>
                )}

                {counselor.shortDescription && (
                  <p className="text-sm text-slate-300 max-w-md">{counselor.shortDescription}</p>
                )}

                {/* Color picker for superadmin */}
                {isSuperadmin && (
                  <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                    <Palette size={13} className="text-slate-400"/>
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        className="w-5 h-5 rounded-full transition-transform hover:scale-125"
                        style={{
                          background: c,
                          border: c === cColor ? '2px solid white' : '2px solid transparent',
                          boxShadow: c === cColor ? `0 0 8px ${c}80` : 'none',
                        }}
                        onClick={() => updateCounselorColor(counselor.id, c)}
                        title={`Cor: ${c}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_,i)=><div key={i} className="skel h-40 rounded-2xl"/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass p-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:'rgba(96,165,250,0.08)',border:'1px solid rgba(96,165,250,0.15)'}}>
                <GraduationCap size={24} className="text-blue-400/50"/>
              </div>
              <p className="font-display text-blue-100/60 font-semibold">{search ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}</p>
              <p className="text-xs text-slate-500">{search ? 'Tente outro termo de busca' : isAllowed ? 'Clique em "Novo Professor" para começar' : 'Os professores aparecerão aqui em breve'}</p>
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
                  className="glass glass-card p-5"
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  layout
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-blue-50 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-300 mt-1">Matéria: <span className="text-sky-300">{t.subject || '—'}</span></p>
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
                {selected.isCounselor && (
                  <p className="text-xs text-center mt-1 font-semibold" style={{color: selected.counselorColor || '#ffd700'}}>
                    ⭐ Professor Conselheiro
                  </p>
                )}

                {selected.catchphrase && (
                  <div className="mt-5 p-4 rounded-xl surface-muted">
                    <p className="text-xs text-sky-200/70 uppercase tracking-wider mb-2">Bordão</p>
                    <p className="text-sm text-blue-100">"{selected.catchphrase}"</p>
                  </div>
                )}

                {selected.longDescription && <p className="text-slate-300 text-sm mt-4 whitespace-pre-line">{selected.longDescription}</p>}

                {isSuperadmin && !selected.isCounselor && (
                  <div className="mt-5 space-y-3">
                    <p className="text-xs text-slate-400 text-center">Escolha a cor do conselheiro:</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          className="w-6 h-6 rounded-full transition-transform hover:scale-125"
                          style={{
                            background: c,
                            border: c === counselorColor ? '2px solid white' : '2px solid transparent',
                            boxShadow: c === counselorColor ? `0 0 8px ${c}80` : 'none',
                          }}
                          onClick={() => setCounselorColor(c)}
                        />
                      ))}
                    </div>
                    <button
                      className="w-full justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background:`${counselorColor}18`, border:`1px solid ${counselorColor}55`, color: counselorColor }}
                      onClick={()=>{ setCounselor(selected.id, counselorColor); setModal(null) }}
                    >
                      <Crown size={15} fill="currentColor"/> Definir como Conselheiro
                    </button>
                  </div>
                )}
                {isSuperadmin && selected.isCounselor && (
                  <div className="mt-5 space-y-2">
                    <p className="text-xs text-slate-400 text-center">Alterar cor do conselheiro:</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          className="w-6 h-6 rounded-full transition-transform hover:scale-125"
                          style={{
                            background: c,
                            border: c === (selected.counselorColor || '#ffd700') ? '2px solid white' : '2px solid transparent',
                            boxShadow: c === (selected.counselorColor || '#ffd700') ? `0 0 8px ${c}80` : 'none',
                          }}
                          onClick={() => updateCounselorColor(selected.id, c)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {isAllowed && (
                  <button className="btn-g w-full justify-center mt-3" onClick={()=>{setEditing(selected);setForm({name:selected.name,subject:selected.subject||'',shortDescription:selected.shortDescription||'',longDescription:selected.longDescription||'',catchphrase:selected.catchphrase||''});setModal('form')}}>
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
              <div>
                <label className="lbl">Nome *</label>
                <input
                  className={`inp ${fieldErrors.name ? 'border-red-500/60' : ''}`}
                  value={form.name}
                  onChange={e=>{setForm({...form,name:e.target.value});setFieldErrors(p=>({...p,name:undefined}))}}
                />
                {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
              </div>
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
  )
}
