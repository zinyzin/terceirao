// src/pages/ProductsPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ShoppingCart, Trash2, Edit2, Package, X } from 'lucide-react'
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
  const [editingSale, setEditingSale] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [sales, setSales] = useState([])

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

  const loadSales = async (productId) => {
    try {
      const { data } = await api.get(`/products/${productId}/sales`)
      setSales(data)
    } catch (e) {
      console.error('Erro ao carregar vendas:', e)
    }
  }

  const openProductDetail = async (product) => {
    setSelectedProduct(product)
    await loadSales(product.id)
    setModal('detail')
  }

  const openEditSale = (sale) => {
    setEditingSale(sale)
    setSell({quantity: sale.quantity, studentId: sale.studentId || ''})
    setModal('edit-sale')
  }

  const handleEditSale = async e => {
    e.preventDefault()
    try {
      await api.put(`/products/${selectedProduct.id}/sales/${editingSale.id}`, {
        quantity: parseInt(sell.quantity),
        studentId: sell.studentId || null
      })
      setModal(null)
      setEditingSale(null)
      setSell({quantity:1,studentId:''})
      load()
      if (selectedProduct) loadSales(selectedProduct.id)
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao editar venda')
    }
  }

  const handleDeleteSale = async (saleId) => {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) return
    try {
      await api.delete(`/products/${selectedProduct.id}/sales/${saleId}`)
      load()
      if (selectedProduct) loadSales(selectedProduct.id)
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao excluir venda')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    try {
      await api.delete(`/products/${id}`)
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao excluir')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="stitle">Produtos</h1>
        <button className="btn-g" onClick={()=>setModal('create')}><Plus size={15}/>Novo</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p,i) => (
          <motion.div key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.07}} className="glass p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-sm font-bold text-blue-50">{p.name}</h3>
                {p.description && <p className="text-xs text-slate-300">{p.description}</p>}
              </div>
              <p className="money-pos font-mono font-bold">{fmt(p.price)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 rounded-lg surface-muted"><p className="text-slate-400">Vendidos</p><p className="font-mono font-bold text-blue-100">{p.totalSold}</p></div>
              <div className="text-center p-2 rounded-lg surface-muted"><p className="text-slate-400">Receita</p><p className="font-mono font-bold money-pos">{fmt(p.totalRevenue)}</p></div>
            </div>
            <div className="flex gap-2">
              <button className="btn-g flex-1 justify-center text-xs" onClick={()=>{setActive(p.id);setModal('sell')}}><ShoppingCart size={12}/>Vender</button>
              <button className="btn-ghost px-3 text-xs" onClick={()=>openProductDetail(p)} title="Ver vendas"><Package size={14}/></button>
              <button className="btn-danger px-3 text-xs" onClick={()=>handleDelete(p.id)} title="Excluir"><Trash2 size={14}/></button>
            </div>
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

      <Modal open={modal==='detail'} onClose={()=>setModal(null)} title={selectedProduct?.name ? `Vendas: ${selectedProduct.name}` : 'Histórico de Vendas'}>
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400">Preço unitário</p>
                <p className="money-pos font-mono font-bold">{fmt(selectedProduct.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Total vendido</p>
                <p className="font-mono font-bold text-blue-100">{selectedProduct.totalSold} unidades</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-blue-100 mb-2">Histórico de Vendas</h4>
              {sales.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sales.map(sale => (
                    <div key={sale.id} className="flex items-center justify-between p-3 rounded surface-muted">
                      <div>
                        <p className="font-mono font-semibold">{sale.quantity}x = {fmt(sale.total)}</p>
                        {sale.student?.name && <p className="text-sm text-slate-300">Aluno: {sale.student.name}</p>}
                        <p className="text-xs text-slate-400">{new Date(sale.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="btn-ghost p-2" 
                          onClick={() => {setModal(null); openEditSale(sale);}}
                        >
                          <Edit2 size={14}/>
                        </button>
                        <button 
                          className="btn-danger p-2" 
                          onClick={() => handleDeleteSale(sale.id)}
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Nenhuma venda registrada.</p>
              )}
            </div>
            
            <button className="btn-ghost w-full justify-center" onClick={()=>setModal(null)}>
              <X size={14}/> Fechar
            </button>
          </div>
        )}
      </Modal>

      <Modal open={modal==='edit-sale'} onClose={()=>setModal(null)} title="✏️ Editar Venda">
        <form onSubmit={handleEditSale} className="space-y-4">
          <div><label className="lbl">Quantidade *</label><input type="number" min="1" className="inp" value={sell.quantity} onChange={e=>setSell({...sell,quantity:e.target.value})} required/></div>
          <div><label className="lbl">Aluno (opcional)</label>
            <select className="inp" value={sell.studentId} onChange={e=>setSell({...sell,studentId:e.target.value})}>
              <option value="">— Nenhum —</option>
              {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
