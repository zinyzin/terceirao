// src/pages/ContributorsPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, DollarSign } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'

const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`

export default function ContributorsPage() {
  const [list, setList] = useState([])
  const [modal, setModal] = useState(null)
  const [active, setActive] = useState(null)
  const [form, setForm] = useState({name:'',email:'',phone:''})
  const [don, setDon] = useState({amount:'',description:''})

  const load = () => api.get('/contributors').then(r=>setList(r.data))
  useEffect(()=>{ load() },[])

  const create = async e => {
    e.preventDefault(); await api.post('/contributors', form)
    setModal(null); setForm({name:'',email:'',phone:''}); load()
  }
  const donate = async e => {
    e.preventDefault(); await api.post(`/contributors/${active}/donate`, {...don,amount:parseFloat(don.amount)})
    setModal(null); setDon({amount:'',description:''}); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="stitle">Contribuidores</h1>
        <button className="btn-g" onClick={()=>setModal('create')}><Plus size={15}/>Novo</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((c,i) => (
          <motion.div key={c.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.06}} className="glass p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div><h3 className="font-display text-sm font-bold text-green-100">{c.name}</h3>
                {c.email && <p className="text-xs text-green-800">{c.email}</p>}
              </div>
              <p className="money-pos font-mono font-bold text-sm">{fmt(c.total)}</p>
            </div>
            <p className="text-xs text-green-900">{c.donations?.length||0} doação(ões)</p>
            <button className="btn-g w-full justify-center text-xs" onClick={()=>{setActive(c.id);setModal('donate')}}><DollarSign size={12}/>Registrar Doação</button>
          </motion.div>
        ))}
      </div>
      <Modal open={modal==='create'} onClose={()=>setModal(null)} title="Novo Contribuidor">
        <form onSubmit={create} className="space-y-4">
          <div><label className="lbl">Nome *</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
          <div><label className="lbl">Email</label><input type="email" className="inp" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div><label className="lbl">Telefone</label><input className="inp" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Criar</button>
          </div>
        </form>
      </Modal>
      <Modal open={modal==='donate'} onClose={()=>setModal(null)} title="💰 Registrar Doação">
        <form onSubmit={donate} className="space-y-4">
          <div><label className="lbl">Valor (R$) *</label><input type="number" step="0.01" min="0.01" className="inp" value={don.amount} onChange={e=>setDon({...don,amount:e.target.value})} required/></div>
          <div><label className="lbl">Observação</label><input className="inp" value={don.description} onChange={e=>setDon({...don,description:e.target.value})}/></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Confirmar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
