// src/pages/AdminGalleryPage.jsx
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Images, Upload, Trash2, X, Heart, MessageSquare, User } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/auth'
import { toast } from '../components/Toast'
import { confirm } from '../components/ConfirmModal'

const timeAgo = date => {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  return `${Math.floor(diff / 86400)}d atrás`
}

export default function AdminGalleryPage() {
  const { user, can } = useAuthStore()
  const canPost = can('gallery:manage') || can('students:manage') || can('teachers:manage')

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/gallery')
      setItems(data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao carregar galeria')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleFile = e => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  const handlePost = async e => {
    e.preventDefault()
    if (!file) { toast.error('Selecione uma imagem'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      if (title) fd.append('title', title)
      if (description) fd.append('description', description)
      fd.append('category', 'turma')
      const { data } = await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setItems(prev => [data, ...prev])
      setShowForm(false)
      setTitle('')
      setDescription('')
      setFile(null)
      setPreview(null)
      toast.success('Foto publicada!')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao publicar foto')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async id => {
    if (!await confirm('Remover esta foto da galeria?', 'Remover Foto')) return
    try {
      await api.delete(`/gallery/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Foto removida')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao remover foto')
    }
  }

  const cancelForm = () => {
    setShowForm(false)
    setTitle('')
    setDescription('')
    setFile(null)
    setPreview(null)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="stitle flex items-center gap-2"><Images size={22}/>Galeria da Turma</h1>
          <p className="text-sm text-slate-400 mt-1">Fotos compartilhadas pelos admins</p>
        </div>
        {canPost && !showForm && (
          <button className="btn-g" onClick={() => setShowForm(true)}>
            <Upload size={15}/> Nova Foto
          </button>
        )}
      </div>

      {/* Upload form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-blue-100 text-sm">Nova publicação</p>
              <button onClick={cancelForm} className="text-slate-400 hover:text-slate-200 transition-colors">
                <X size={16}/>
              </button>
            </div>

            <form onSubmit={handlePost} className="space-y-4">
              {/* Image picker */}
              <div
                className="relative border-2 border-dashed border-blue-300/20 rounded-xl overflow-hidden cursor-pointer hover:border-blue-300/40 transition-colors"
                style={{ minHeight: 180 }}
                onClick={() => fileRef.current?.click()}
              >
                {preview
                  ? <img src={preview} alt="preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 320 }}/>
                  : (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
                      <Images size={32}/>
                      <p className="text-sm">Clique para escolher uma foto</p>
                    </div>
                  )
                }
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
              </div>

              <div>
                <label className="lbl">Título <span className="text-slate-500">(opcional)</span></label>
                <input className="inp" placeholder="Ex: Aula de Biologia..." value={title} onChange={e => setTitle(e.target.value)}/>
              </div>
              <div>
                <label className="lbl">Descrição <span className="text-slate-500">(opcional)</span></label>
                <textarea className="inp" rows={3} placeholder="Conta o que está acontecendo..." value={description} onChange={e => setDescription(e.target.value)}/>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={cancelForm} className="btn-ghost flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-g flex-1 justify-center" disabled={uploading}>
                  {uploading ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass p-4 space-y-3">
              <div className="flex gap-3 items-center">
                <div className="skel w-9 h-9 rounded-full"/>
                <div className="skel h-4 w-36 rounded"/>
              </div>
              <div className="skel h-64 rounded-xl"/>
              <div className="skel h-3 w-2/3 rounded"/>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Images size={40} className="mx-auto mb-3 opacity-30"/>
          <p>Nenhuma foto publicada ainda.</p>
          {canPost && <p className="text-sm mt-1">Seja o primeiro a compartilhar!</p>}
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04 }}
                className="glass overflow-hidden"
              >
                {/* Post header */}
                <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-300/25 flex items-center justify-center flex-shrink-0">
                      <User size={15} className="text-blue-300"/>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-100 leading-tight">
                        {item.postedBy?.name || 'Admin'}
                      </p>
                      <p className="text-xs text-slate-400">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>

                  {(user?.role === 'SUPERADMIN' || item.postedById === user?.id) && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Remover foto"
                    >
                      <Trash2 size={15}/>
                    </button>
                  )}
                </div>

                {/* Image */}
                <img
                  src={item.imageUrl}
                  alt={item.title || 'Galeria da turma'}
                  className="w-full object-cover"
                  style={{ maxHeight: 480 }}
                />

                {/* Caption */}
                {(item.title || item.description) && (
                  <div className="px-4 py-3 space-y-1">
                    {item.title && (
                      <p className="text-sm font-semibold text-blue-100">{item.title}</p>
                    )}
                    {item.description && (
                      <p className="text-sm text-slate-300 whitespace-pre-line">{item.description}</p>
                    )}
                  </div>
                )}

                {/* Footer spacer */}
                <div className="px-4 pb-4 pt-1 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Heart size={13}/> Turma Pantera</span>
                  <span className="flex items-center gap-1"><MessageSquare size={13}/> {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
