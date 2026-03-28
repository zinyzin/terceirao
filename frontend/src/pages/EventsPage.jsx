// src/pages/EventsPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar, Clock, MapPin, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import { useAuthStore } from '../store/auth'

const typeColors = {
  GENERAL: '#60a5fa',
  MEETING: '#a78bfa',
  DEADLINE: '#f87171',
  PAYMENT: '#34d399',
  RAFFLE: '#fbbf24',
  CELEBRATION: '#f472b6'
}

const typeLabels = {
  GENERAL: 'Geral',
  MEETING: 'Reunião',
  DEADLINE: 'Prazo',
  PAYMENT: 'Pagamento',
  RAFFLE: 'Rifa',
  CELEBRATION: 'Comemoração'
}

export default function EventsPage() {
  const { isAuth, can } = useAuthStore()
  const isAllowed = isAuth && can('students:manage')
  
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    type: 'GENERAL'
  })

  const load = async () => {
    setLoading(true)
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const { data } = await api.get('/events', {
        params: {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        }
      })
      setEvents(data)
    } catch (e) {
      console.error('Erro ao carregar eventos:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [currentDate])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null
      }
      
      if (editing) {
        await api.put(`/events/${editing.id}`, payload)
      } else {
        await api.post('/events', payload)
      }
      
      setModal(null)
      setEditing(null)
      setForm({ title: '', description: '', startDate: '', endDate: '', location: '', type: 'GENERAL' })
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao salvar evento')
    }
  }

  const handleDelete = async id => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return
    try {
      await api.delete(`/events/${id}`)
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao excluir')
    }
  }

  const openEdit = event => {
    setEditing(event)
    setForm({
      title: event.title,
      description: event.description || '',
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      type: event.type
    })
    setModal('form')
  }

  // Calendar grid logic
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  const getEventsForDay = day => {
    if (!day) return []
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
    return events.filter(e => new Date(e.startDate).toDateString() === dateStr)
  }

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-blue-300"/>
          <h1 className="stitle">Calendário de Eventos</h1>
        </div>
        {isAllowed && (
          <button className="btn-g" onClick={() => { setEditing(null); setForm({ title: '', description: '', startDate: '', endDate: '', location: '', type: 'GENERAL' }); setModal('form') }}>
            <Plus size={15}/> Novo Evento
          </button>
        )}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button className="btn-ghost p-2" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}>
          <ChevronLeft size={20}/>
        </button>
        <h2 className="font-display text-lg font-bold text-blue-100">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button className="btn-ghost p-2" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}>
          <ChevronRight size={20}/>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="glass overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-slate-800/30">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-xs font-bold text-slate-400 bg-slate-900/50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-800/30">
          {getDaysInMonth().map((day, i) => {
            const dayEvents = getEventsForDay(day)
            const isToday = day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear()
            
            return (
              <div
                key={i}
                className={`min-h-[100px] p-2 bg-slate-900/30 ${isToday ? 'ring-2 ring-blue-500/50' : ''}`}
              >
                {day && (
                  <>
                    <p className={`text-sm font-medium ${isToday ? 'text-blue-300' : 'text-slate-300'}`}>{day}</p>
                    <div className="mt-1 space-y-1">
                      {dayEvents.map(event => (
                        <button
                          key={event.id}
                          className="w-full text-left text-xs p-1 rounded truncate transition-colors hover:opacity-80"
                          style={{ backgroundColor: `${typeColors[event.type]}30`, borderLeft: `3px solid ${typeColors[event.type]}` }}
                          onClick={() => isAllowed ? openEdit(event) : alert(`${event.title}\n\n${event.description || ''}`)}
                          title={event.title}
                        >
                          {event.title}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-2">
        <h3 className="font-display text-sm font-semibold text-blue-100">Eventos do Mês</h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="skel h-16 rounded-xl"/>)}
          </div>
        ) : events.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhum evento neste mês</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {events.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: typeColors[event.type] }}
                      />
                      <span className="text-xs text-slate-400">{typeLabels[event.type]}</span>
                    </div>
                    {isAllowed && (
                      <div className="flex gap-1">
                        <button className="p-1 text-slate-400 hover:text-blue-300" onClick={() => openEdit(event)}>
                          <Edit2 size={14}/>
                        </button>
                        <button className="p-1 text-slate-400 hover:text-red-400" onClick={() => handleDelete(event.id)}>
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-blue-100">{event.title}</h4>
                  {event.description && <p className="text-xs text-slate-400">{event.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12}/>
                      {new Date(event.startDate).toLocaleDateString('pt-BR')} {new Date(event.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12}/> {event.location}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(typeLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors[key] }}/>
            {label}
          </div>
        ))}
      </div>

      {/* Event Modal */}
      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editing ? 'Editar Evento' : 'Novo Evento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="lbl">Título *</label>
            <input className="inp" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required/>
          </div>
          <div>
            <label className="lbl">Descrição</label>
            <textarea className="inp" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="lbl">Início *</label>
              <input type="datetime-local" className="inp" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required/>
            </div>
            <div>
              <label className="lbl">Término</label>
              <input type="datetime-local" className="inp" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}/>
            </div>
          </div>
          <div>
            <label className="lbl">Local</label>
            <input className="inp" value={form.location} onChange={e => setForm({...form, location: e.target.value})}/>
          </div>
          <div>
            <label className="lbl">Tipo</label>
            <select className="inp" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="btn-danger flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-g flex-1 justify-center">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
