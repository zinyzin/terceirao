// src/pages/SettingsPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, RefreshCw, Settings, DollarSign, Palette, Globe, Mail } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const isSuperadmin = user?.role === 'SUPERADMIN'
  
  const [settings, setSettings] = useState({
    siteName: 'Turma Pantera',
    siteDescription: 'Formatura 2026',
    graduationYear: '2026',
    goalAmount: '50000',
    currency: 'BRL',
    contactEmail: '',
    enablePublicGallery: 'true',
    enablePublicContributors: 'true',
    themePrimary: '#60a5fa',
    themeSecondary: '#38bdf8',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/settings')
      setSettings(prev => ({ ...prev, ...data }))
    } catch (e) {
      console.error('Erro ao carregar configurações:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!isSuperadmin) {
      alert('Apenas Superadmin pode salvar configurações')
      return
    }
    
    setSaving(true)
    setMessage('')
    try {
      await api.put('/settings', settings)
      setMessage('Configurações salvas com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Deseja resetar todas as configurações para o padrão?')) {
      load()
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="stitle">Configurações</h1>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skel h-16 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="stitle flex items-center gap-2">
          <Settings size={20}/> Configurações
        </h1>
        {isSuperadmin && (
          <div className="flex gap-2">
            <button className="btn-ghost text-sm" onClick={handleReset}>
              <RefreshCw size={14}/> Resetar
            </button>
            <button className="btn-g text-sm" onClick={handleSave} disabled={saving}>
              <Save size={14}/> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
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

      {!isSuperadmin && (
        <div className="glass p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-yellow-700">
            Modo visualização. Apenas Superadmin pode editar configurações.
          </p>
        </div>
      )}

      {/* Site Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">
        <h2 className="font-display text-sm font-semibold text-blue-100 flex items-center gap-2">
          <Globe size={16}/> Informações do Site
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="lbl">Nome do Site</label>
            <input 
              className="inp" 
              value={settings.siteName} 
              onChange={e => updateSetting('siteName', e.target.value)}
              disabled={!isSuperadmin}
            />
          </div>
          <div>
            <label className="lbl">Descrição</label>
            <input 
              className="inp" 
              value={settings.siteDescription} 
              onChange={e => updateSetting('siteDescription', e.target.value)}
              disabled={!isSuperadmin}
            />
          </div>
          <div>
            <label className="lbl">Ano de Formatura</label>
            <input 
              className="inp" 
              type="number"
              value={settings.graduationYear} 
              onChange={e => updateSetting('graduationYear', e.target.value)}
              disabled={!isSuperadmin}
            />
          </div>
          <div>
            <label className="lbl flex items-center gap-2">
              <Mail size={14}/> Email de Contato
            </label>
            <input 
              className="inp" 
              type="email"
              value={settings.contactEmail} 
              onChange={e => updateSetting('contactEmail', e.target.value)}
              disabled={!isSuperadmin}
            />
          </div>
        </div>
      </motion.div>

      {/* Financial Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 space-y-4">
        <h2 className="font-display text-sm font-semibold text-blue-100 flex items-center gap-2">
          <DollarSign size={16}/> Configurações Financeiras
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="lbl">Meta de Arrecadação (R$)</label>
            <input 
              className="inp" 
              type="number"
              value={settings.goalAmount} 
              onChange={e => updateSetting('goalAmount', e.target.value)}
              disabled={!isSuperadmin}
            />
          </div>
          <div>
            <label className="lbl">Moeda</label>
            <select 
              className="inp" 
              value={settings.currency} 
              onChange={e => updateSetting('currency', e.target.value)}
              disabled={!isSuperadmin}
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Public Access */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 space-y-4">
        <h2 className="font-display text-sm font-semibold text-blue-100 flex items-center gap-2">
          <Globe size={16}/> Acesso Público
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg surface-muted">
            <div>
              <p className="font-medium text-blue-100">Galeria Pública</p>
              <p className="text-xs text-slate-400">Permitir visitantes verem a galeria</p>
            </div>
            <input 
              type="checkbox"
              checked={settings.enablePublicGallery === 'true'}
              onChange={e => updateSetting('enablePublicGallery', e.target.checked ? 'true' : 'false')}
              disabled={!isSuperadmin}
              className="w-5 h-5"
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg surface-muted">
            <div>
              <p className="font-medium text-blue-100">Contribuidores Públicos</p>
              <p className="text-xs text-slate-400">Permitir visitantes verem o ranking</p>
            </div>
            <input 
              type="checkbox"
              checked={settings.enablePublicContributors === 'true'}
              onChange={e => updateSetting('enablePublicContributors', e.target.checked ? 'true' : 'false')}
              disabled={!isSuperadmin}
              className="w-5 h-5"
            />
          </div>
        </div>
      </motion.div>

      {/* Theme Colors */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 space-y-4">
        <h2 className="font-display text-sm font-semibold text-blue-100 flex items-center gap-2">
          <Palette size={16}/> Cores do Tema
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="lbl">Cor Primária</label>
            <div className="flex gap-2">
              <input 
                className="inp flex-1" 
                value={settings.themePrimary} 
                onChange={e => updateSetting('themePrimary', e.target.value)}
                disabled={!isSuperadmin}
              />
              <input 
                type="color"
                value={settings.themePrimary}
                onChange={e => updateSetting('themePrimary', e.target.value)}
                disabled={!isSuperadmin}
                className="w-12 h-10 rounded cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="lbl">Cor Secundária</label>
            <div className="flex gap-2">
              <input 
                className="inp flex-1" 
                value={settings.themeSecondary} 
                onChange={e => updateSetting('themeSecondary', e.target.value)}
                disabled={!isSuperadmin}
              />
              <input 
                type="color"
                value={settings.themeSecondary}
                onChange={e => updateSetting('themeSecondary', e.target.value)}
                disabled={!isSuperadmin}
                className="w-12 h-10 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
