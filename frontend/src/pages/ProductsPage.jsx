// src/pages/ProductsPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ShoppingCart } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'

const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [students, setStudents] = useState([])
  const [modal, setModal] = useState(null)
  const [active, setActive] = useState(null)
  const [form, setForm] = useState({name:'',description:'',price:''})
  const [sell, setSell] = useState({quantity:1,studentId:''})

  const load = async () => {
    const [p,s] = await Promise.all([api.get('/products'), api.get('/students')])
    setProducts(p.data); setStudents(s.data)
  }
  useEffect(()=>{ load() },[])

  const create = async e => {
    e.preventDefault(); await api.post('/products', {...form, price:parseFloat(form.price)})
    setModal(null); setForm({name:'',description:'',price:''}); load()
  }
  const doSell = async e => {
    e.preventDefault(); await api.post(`/products/${active}/sell`, {...sell,quantity:parseInt(sell.quantity)})
    setModal(null); setSell({quantity:1,studentId:''}); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="stitle">Produtos</h1>
        <button className="btn-g" onClick={()=>setModal('create')}><Plus size={15}/>Novo</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p,i) => (
          <motion.div key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.07}} className="glass p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-sm font-bold text-green-100">{p.name}</h3>
                {p.description && <p className="text-xs text-green-800">{p.description}</p>}
              </div>
              <p className="money-pos font-mono font-bold">{fmt(p.price)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 rounded-lg" style={{background:'rgba(4,20,8,0.6)'}}><p className="text-green-800">Vendidos</p><p className="font-mono font-bold text-green-300">{p.totalSold}</p></div>
              <div className="text-center p-2 rounded-lg" style={{background:'rgba(4,20,8,0.6)'}}><p className="text-green-800">Receita</p><p className="font-mono font-bold money-pos">{fmt(p.totalRevenue)}</p></div>
            </div>
            <button className="btn-g w-full justify-center text-xs" onClick={()=>{setActive(p.id);setModal('sell')}}><ShoppingCart size={12}/>Venda</button>
          </motion.div>
        ))}
      </div>
      <Modal open={modal==='create'} onClose={()=>setModal(null)} title="Novo Produto">
        <form onSubmit={create} className="space-y-4">
          <div><label className="lbl">Nome *</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
          <div><label className="lbl">Preço (R$) *</label><input type="number" step="0.01" className="inp" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required/></div>
          <div><label className="lbl">Descrição</label><textarea className="inp" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Criar</button>
          </div>
        </form>
      </Modal>
      <Modal open={modal==='sell'} onClose={()=>setModal(null)} title="Registrar Venda">
        <form onSubmit={doSell} className="space-y-4">
          <div><label className="lbl">Quantidade *</label><input type="number" min="1" className="inp" value={sell.quantity} onChange={e=>setSell({...sell,quantity:e.target.value})} required/></div>
          <div><label className="lbl">Aluno (opcional)</label>
            <select className="inp" value={sell.studentId} onChange={e=>setSell({...sell,studentId:e.target.value})}>
              <option value="">— Nenhum —</option>
              {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Confirmar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
