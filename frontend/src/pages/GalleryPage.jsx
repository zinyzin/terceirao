import { useEffect, useState } from 'react'
import { Upload, Trash2, Images } from 'lucide-react'
import axios from 'axios'
import api from '../lib/api'
import { useAuthStore } from '../store/auth'
import { toast } from '../components/Toast'
import { confirm } from '../components/ConfirmModal'

export default function GalleryPage() {
  const { isAuth, can } = useAuthStore()
  const isAllowed = isAuth && can('gallery:manage')
  const [items, setItems] = useState([])
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const client = isAllowed ? api : axios
      const path = isAllowed ? '/gallery' : '/api/public/gallery'
      const { data } = await client.get(path)
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [isAllowed])

  const handleUpload = async e => {
    e.preventDefault()
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    fd.append('title', title)
    fd.append('category', 'general')
    await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setFile(null)
    setTitle('')
    load()
  }

  const handleDelete = async id => {
    if (!await confirm('Remover esta imagem da galeria?', 'Remover Imagem')) return
    try {
      await api.delete(`/gallery/${id}`)
      toast.success('Imagem removida.')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao remover imagem')
    }
  }

  return (
    <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="stitle flex items-center gap-2"><Images size={22}/>Galeria</h1>
              <p className="text-sm text-slate-300 mt-2">Fotos da turma para visualização pública e uso interno nos cadastros.</p>
            </div>
          </div>

          {isAllowed && (
            <form onSubmit={handleUpload} className="glass p-4 md:p-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input className="inp" placeholder="Título da imagem" value={title} onChange={e => setTitle(e.target.value)} />
              <input className="inp" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
              <button className="btn-g justify-center" type="submit"><Upload size={15}/>Enviar</button>
            </form>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skel h-44 rounded-2xl" />)}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map(item => (
                <div key={item.id} className="glass p-3 space-y-3">
                  <img src={item.imageUrl} alt={item.title || 'Galeria'} className="w-full h-40 object-cover rounded-xl border border-blue-300/10" />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-blue-100 truncate">{item.title || 'Sem título'}</p>
                    {isAllowed && (
                      <button className="text-red-400 hover:text-red-300 transition-colors" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={15}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!items.length && <div className="col-span-full text-center text-slate-400 py-10">Nenhuma imagem cadastrada.</div>}
            </div>
          )}
    </div>
  )
}
