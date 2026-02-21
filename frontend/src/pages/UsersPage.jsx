// src/pages/UsersPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ToggleLeft, ToggleRight, Key, Trash2, Shield } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'create' | 'pw'
  const [selected, setSelected] = useState(null)
  const [err, setErr] = useState('')

  const [form, setForm] = useState({ username:'', password:'', name:'', role:'ADMIN' })
  const [pwForm, setPwForm] = useState({ password:'' })

  const load = () => api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleCreate = async e => {
    e.preventDefault(); setErr('')
    try {
      await api.post('/users', form)
      setModal(null); setForm({ username:'', password:'', name:'', role:'ADMIN' }); load()
    } catch(e) { setErr(e.response?.data?.error || 'Erro') }
  }

  const handlePw = async e => {
    e.preventDefault(); setErr('')
    try {
      await api.patch(`/users/${selected.id}/password`, pwForm)
      setModal(null); setPwForm({ password:'' }); setSelected(null)
    } catch(e) { setErr(e.response?.data?.error || 'Erro') }
  }

  const toggle = async id => {
    await api.patch(`/users/${id}/toggle`); load()
  }

  const del = async id => {
    if (!confirm('Remover este usuário?')) return
    await api.delete(`/users/${id}`); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-green-400"/>
          <h1 className="stitle">Usuários do Sistema</h1>
        </div>
        <button className="btn-g" onClick={() => { setErr(''); setModal('create') }}>
          <Plus size={15}/> Novo Admin
        </button>
      </div>

      <p className="text-xs text-green-900 font-mono">Você pode definir usuário e senha personalizados para cada administrador.</p>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Nome</th><th>Usuário</th><th>Role</th><th>Status</th><th>Criado em</th><th>Ações</th></tr></thead>
            <tbody>
              {loading
                ? [...Array(3)].map((_,i) => <tr key={i}>{[...Array(6)].map((_,j) => <td key={j}><div className="skel h-4 rounded"/></td>)}</tr>)
                : users.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium text-green-100">{u.name}</td>
                    <td className="font-mono text-xs text-green-500">@{u.username}</td>
                    <td><span className={u.role==='SUPERADMIN'?'badge badge-g':'badge badge-b'}>{u.role}</span></td>
                    <td><span className={u.isActive?'badge badge-g':'badge badge-r'}>{u.isActive?'Ativo':'Inativo'}</span></td>
                    <td className="font-mono text-xs text-green-800">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggle(u.id)} className={`text-xs flex items-center gap-1 transition-colors ${u.isActive?'text-red-500 hover:text-red-300':'text-green-700 hover:text-green-400'}`}>
                          {u.isActive ? <ToggleRight size={15}/> : <ToggleLeft size={15}/>}
                        </button>
                        <button onClick={() => { setSelected(u); setErr(''); setModal('pw') }} className="text-yellow-600 hover:text-yellow-400 transition-colors"><Key size={14}/></button>
                        <button onClick={() => del(u.id)} className="text-red-700 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      <Modal open={modal==='create'} onClose={() => setModal(null)} title="➕ Novo Administrador">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="lbl">Nome completo *</label>
            <input className="inp" placeholder="Ex: Maria Silva" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          </div>
          <div>
            <label className="lbl">Usuário (login) *</label>
            <input className="inp font-mono" placeholder="Ex: maria_admin" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required/>
            <p className="text-xs text-green-900 mt-1">Apenas letras, números e _ (underline)</p>
          </div>
          <div>
            <label className="lbl">Senha *</label>
            <input className="inp" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6}/>
          </div>
          <div>
            <label className="lbl">Nível de acesso</label>
            <select className="inp" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="ADMIN">Admin</option>
              <option value="SUPERADMIN">Superadmin</option>
            </select>
          </div>
          {err && <p className="text-red-400 text-xs text-center py-2 rounded-lg" style={{background:'rgba(255,60,60,0.08)'}}>{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Criar Admin</button>
          </div>
        </form>
      </Modal>

      {/* Reset password modal */}
      <Modal open={modal==='pw'} onClose={() => setModal(null)} title={`🔑 Redefinir Senha — ${selected?.name}`}>
        <form onSubmit={handlePw} className="space-y-4">
          <div>
            <label className="lbl">Nova Senha *</label>
            <input className="inp" type="password" placeholder="Mínimo 6 caracteres" value={pwForm.password} onChange={e=>setPwForm({password:e.target.value})} required minLength={6}/>
          </div>
          {err && <p className="text-red-400 text-xs text-center">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
