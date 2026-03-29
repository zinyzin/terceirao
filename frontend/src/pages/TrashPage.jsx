// src/pages/TrashPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RotateCcw, AlertTriangle, User, GraduationCap, Package, Search } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import { toast } from '../components/Toast'

const typeIcons = {
  STUDENT: User,
  TEACHER: GraduationCap,
  PRODUCT: Package,
}

const typeLabels = {
  STUDENT: 'Aluno',
  TEACHER: 'Professor',
  PRODUCT: 'Produto',
}

export default function TrashPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // 'restore' | 'delete'
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/trash')
      setItems(data.items)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao carregar lixeira')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRestore = async () => {
    if (!selected) return
    try {
      await api.post(`/trash/${selected.type}/${selected.id}/restore`)
      setMessage('Item restaurado com sucesso!')
      setModal(null)
      setSelected(null)
      load()
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao restaurar item')
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    try {
      await api.delete(`/trash/${selected.type}/${selected.id}`)
      setMessage('Item excluído permanentemente!')
      setModal(null)
      setSelected(null)
      load()
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao excluir item permanentemente')
    }
  }

  const filtered = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    typeLabels[item.type].toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Trash2 size={20} className="text-red-400"/>
          <h1 className="stitle">Lixeira</h1>
        </div>
        <p className="text-xs text-slate-400 font-mono">{items.length} itens excluídos</p>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 border-l-4 border-green-500"
        >
          <p className="text-sm text-green-800">{message}</p>
        </motion.div>
      )}

      <div className="glass p-4 border-l-4 border-yellow-500 flex items-start gap-3">
        <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5"/>
        <div>
          <p className="text-sm text-yellow-200 font-medium">Atenção</p>
          <p className="text-xs text-yellow-700/70">Itens na lixeira podem ser restaurados ou excluídos permanentemente. A exclusão permanente não pode ser desfeita.</p>
        </div>
      </div>

      <div className="relative max-w-xs w-full">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input 
          className="inp pl-9" 
          placeholder="Buscar na lixeira..." 
          value={search} 
          onChange={e=>setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="skel h-32 rounded-xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 size={48} className="text-slate-600 mx-auto mb-4"/>
          <p className="text-slate-400">Lixeira vazia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const Icon = typeIcons[item.type] || Package
              return (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center">
                        <Icon size={20} className="text-slate-400"/>
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-blue-100 truncate max-w-[150px]">{item.title}</p>
                        <span className="text-xs text-slate-400">{typeLabels[item.type]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    {item.subject && <p>Matéria: {item.subject}</p>}
                    {item.price && <p>Preço: R$ {Number(item.price).toFixed(2)}</p>}
                    <p>Excluído em: {new Date(item.updatedAt).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      className="btn-g flex-1 justify-center text-xs"
                      onClick={() => { setSelected(item); setModal('restore') }}
                    >
                      <RotateCcw size={14}/> Restaurar
                    </button>
                    <button 
                      className="btn-danger px-3 text-xs"
                      onClick={() => { setSelected(item); setModal('delete') }}
                      title="Excluir permanentemente"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Restore Modal */}
      <Modal open={modal==='restore'} onClose={()=>setModal(null)} title="Restaurar Item">
        {selected && (
          <div className="space-y-4">
            <p className="text-slate-300">Tem certeza que deseja restaurar <strong className="text-blue-100">{selected.title}</strong>?</p>
            <p className="text-xs text-slate-400">O item voltará a aparecer na lista normal.</p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
              <button onClick={handleRestore} className="btn-g flex-1 justify-center">
                <RotateCcw size={14}/> Restaurar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal==='delete'} onClose={()=>setModal(null)} title="⚠️ Excluir Permanentemente">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={20}/>
              <span className="font-bold">Atenção!</span>
            </div>
            <p className="text-slate-300">Você está prestes a excluir <strong className="text-red-200">{selected.title}</strong> permanentemente.</p>
            <p className="text-xs text-red-400/70">Esta ação não pode ser desfeita. Todos os dados serão perdidos.</p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={()=>setModal(null)} className="btn-ghost flex-1 justify-center">Cancelar</button>
              <button onClick={handleDelete} className="btn-danger flex-1 justify-center">
                <Trash2 size={14}/> Excluir Permanentemente
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
