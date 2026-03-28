// src/pages/ContributorsPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, DollarSign, Trash2, Edit2, X, Search } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import axios from 'axios'
import { useAuthStore } from '../store/auth'

const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`

export default function ContributorsPage() {
  const { isAuth, can } = useAuthStore()
  const [list, setList] = useState([])
  const [modal, setModal] = useState(null)
  const [active, setActive] = useState(null)
  const [form, setForm] = useState({name:'',email:'',phone:'',anonymous:false})
  const [don, setDon] = useState({amount:'',description:''})
  const [editingDonation, setEditingDonation] = useState(null)
  const [selectedContributor, setSelectedContributor] = useState(null)
  const [search, setSearch] = useState('')

  const isAllowed = isAuth && can('contributors:manage')

  const load = async () => {
    if (!isAllowed) {
      const { data } = await axios.get('/api/public/contributors')
      setList(data)
      return
    }
    const { data } = await api.get('/contributors')
    setList(data)
  }
  useEffect(()=>{ load() },[isAllowed])

  const create = async e => {
    e.preventDefault();
    await api.post('/contributors', {
      name: form.anonymous ? 'Contribuinte Anônimo' : form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
    })
    setModal(null); setForm({name:'',email:'',phone:'',anonymous:false}); load()
  }
  const donate = async e => {
    e.preventDefault(); await api.post(`/contributors/${active}/donate`, {...don,amount:parseFloat(don.amount)})
    setModal(null); setDon({amount:'',description:''}); load()
  }

  const handleEditDonation = async e => {
    e.preventDefault()
    try {
      await api.put(`/contributors/${selectedContributor.id}/donations/${editingDonation.id}`, {
        amount: parseFloat(don.amount),
        description: don.description
      })
      setModal(null)
      setEditingDonation(null)
      setDon({amount:'',description:''})
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao editar doação')
    }
  }

  const handleDeleteDonation = async (contributorId, donationId) => {
    if (!confirm('Tem certeza que deseja excluir esta doação?')) return
    try {
      await api.delete(`/contributors/${contributorId}/donations/${donationId}`)
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao excluir doação')
    }
  }

  const openEditDonation = (contributor, donation) => {
    setSelectedContributor(contributor)
    setEditingDonation(donation)
    setDon({amount: donation.amount, description: donation.description || ''})
    setModal('edit-donation')
  }

  const openContributorDetail = (contributor) => {
    setSelectedContributor(contributor)
    setModal('detail')
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este contribuidor?')) return
    try {
      await api.delete(`/contributors/${id}`)
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao excluir')
    }
  }

  const filtered = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="stitle">Contribuidores</h1>
        {isAllowed && <button className="btn-g" onClick={()=>setModal('create')}><Plus size={15}/>Novo</button>}
      </div>

      {!isAllowed ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c,i) => (
            <motion.div key={c.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.06}} className="glass p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-green-800">#{c.rank}</p>
                  <h3 className="font-display text-sm font-bold text-green-100 truncate">{c.name}</h3>
                </div>
                <span className={`badge ${c.level==='OURO'?'badge-y':c.level==='PRATA'?'badge-b':c.level==='BRONZE'?'badge-r':'badge-g'}`}>{c.level}</span>
              </div>
              <p className="text-xs text-green-900">Ranking por níveis (sem valores exatos).</p>
            </motion.div>
          ))}
          {!list.length && <div className="text-center text-green-900 py-12">Nenhum contribuidor ainda</div>}
        </div>
      ) : (
        <>
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input className="inp pl-9" placeholder="Buscar contribuidor..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c,i) => (
              <motion.div key={c.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.06}} className="glass p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div><h3 className="font-display text-sm font-bold text-green-100">{c.name}</h3>
                    {c.email && <p className="text-xs text-green-800">{c.email}</p>}
                  </div>
                  <p className="money-pos font-mono font-bold text-sm">{fmt(c.total)}</p>
                </div>
                <p className="text-xs text-green-900">{c.donations?.length||0} doação(ões)</p>
                
                {/* Donations list */}
                {c.donations?.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {c.donations.map(d => (
                      <div key={d.id} className="flex items-center justify-between text-xs p-2 rounded surface-muted">
                        <div className="flex-1 min-w-0">
                          <p className="money-pos font-mono">{fmt(d.amount)}</p>
                          {d.description && <p className="text-green-800 truncate">{d.description}</p>}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button 
                            className="p-1 hover:text-yellow-400 transition-colors" 
                            onClick={() => openEditDonation(c, d)}
                            title="Editar"
                          >
                            <Edit2 size={12}/>
                          </button>
                          <button 
                            className="p-1 hover:text-red-400 transition-colors" 
                            onClick={() => handleDeleteDonation(c.id, d.id)}
                            title="Excluir"
                          >
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <button className="btn-g flex-1 justify-center text-xs" onClick={()=>{setActive(c.id);setModal('donate')}}><DollarSign size={12}/>Nova Doação</button>
                  <button className="btn-ghost px-3 text-xs" onClick={()=>openContributorDetail(c)} title="Ver detalhes">Ver</button>
                  <button className="btn-danger px-3 text-xs" onClick={()=>handleDelete(c.id)} title="Excluir"><Trash2 size={14}/></button>
                </div>
              </motion.div>
            ))}
          </div>

          <Modal open={modal==='create'} onClose={()=>setModal(null)} title="Novo Contribuidor">
            <form onSubmit={create} className="space-y-4">
              <div><label className="lbl">Nome *</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required={!form.anonymous} disabled={form.anonymous}/></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.anonymous} onChange={e=>setForm({...form,anonymous:e.target.checked})}/>
                <span className="text-xs text-green-800">Contribuinte Anônimo</span>
              </div>
              <div><label className="lbl">Email</label><input type="email" className="inp" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div><label className="lbl">Telefone</label><input className="inp" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-g flex-1 justify-center">Criar</button>
              </div>
            </form>
          </Modal>

          <Modal open={modal==='donate'} onClose={()=>setModal(null)} title="💰 Nova Doação">
            <form onSubmit={donate} className="space-y-4">
              <div><label className="lbl">Valor (R$) *</label><input type="number" step="0.01" min="0.01" className="inp" value={don.amount} onChange={e=>setDon({...don,amount:e.target.value})} required/></div>
              <div><label className="lbl">Observação</label><input className="inp" value={don.description} onChange={e=>setDon({...don,description:e.target.value})}/></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-g flex-1 justify-center">Confirmar</button>
              </div>
            </form>
          </Modal>

          <Modal open={modal==='edit-donation'} onClose={()=>setModal(null)} title="✏️ Editar Doação">
            <form onSubmit={handleEditDonation} className="space-y-4">
              <div><label className="lbl">Valor (R$) *</label><input type="number" step="0.01" min="0.01" className="inp" value={don.amount} onChange={e=>setDon({...don,amount:e.target.value})} required/></div>
              <div><label className="lbl">Observação</label><input className="inp" value={don.description} onChange={e=>setDon({...don,description:e.target.value})}/></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-g flex-1 justify-center">Salvar</button>
              </div>
            </form>
          </Modal>

          <Modal open={modal==='detail'} onClose={()=>setModal(null)} title="Detalhes do Contribuidor">
            {selectedContributor && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display text-lg font-bold text-green-100">{selectedContributor.name}</h3>
                    {selectedContributor.email && <p className="text-sm text-green-800">{selectedContributor.email}</p>}
                    {selectedContributor.phone && <p className="text-sm text-green-800">{selectedContributor.phone}</p>}
                  </div>
                  <p className="money-pos font-mono font-bold text-lg">{fmt(selectedContributor.total)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-green-900 mb-2">Histórico de Doações</h4>
                  {selectedContributor.donations?.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedContributor.donations.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-3 rounded surface-muted">
                          <div>
                            <p className="money-pos font-mono font-semibold">{fmt(d.amount)}</p>
                            {d.description && <p className="text-sm text-green-800">{d.description}</p>}
                            <p className="text-xs text-green-900">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="btn-ghost p-2" 
                              onClick={() => {setModal(null); openEditDonation(selectedContributor, d);}}
                            >
                              <Edit2 size={14}/>
                            </button>
                            <button 
                              className="btn-danger p-2" 
                              onClick={() => {setModal(null); handleDeleteDonation(selectedContributor.id, d.id);}}
                            >
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-900 text-sm">Nenhuma doação registrada.</p>
                  )}
                </div>
                
                <button className="btn-ghost w-full justify-center" onClick={()=>setModal(null)}>
                  <X size={14}/> Fechar
                </button>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  )
}
