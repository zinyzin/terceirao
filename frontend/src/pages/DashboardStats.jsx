import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Ticket, Trophy, Calendar } from 'lucide-react'
import api from '../lib/api'
import { CardSkeleton } from '../components/LoadingSkeleton'

const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`

export default function DashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard/stats')
        setStats(data)
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><CardSkeleton count={4} /></div>

  const cards = [
    { 
      title: 'Total Arrecadado', 
      value: fmt(stats?.totalRaised || 0), 
      icon: DollarSign, 
      color: '#22c55e',
      trend: stats?.raisedTrend || 0
    },
    { 
      title: 'Alunos Ativos', 
      value: stats?.activeStudents || 0, 
      icon: Users, 
      color: '#3b82f6',
      subtitle: `${stats?.engagedStudents || 0} engajados`
    },
    { 
      title: 'Rifas Ativas', 
      value: stats?.activeRaffles || 0, 
      icon: Ticket, 
      color: '#a78bfa',
      subtitle: `${stats?.totalTicketsSold || 0} tickets vendidos`
    },
    { 
      title: 'Contribuidores', 
      value: stats?.totalContributors || 0, 
      icon: Trophy, 
      color: '#f59e0b',
      subtitle: `${stats?.topTierContributors || 0} nível ouro`
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="stitle">Estatísticas</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar size={14} />
          <span>Atualizado agora</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10" 
              style={{ background: `radial-gradient(circle, ${card.color}, transparent)` }} />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                  style={{ background: `${card.color}20`, border: `1px solid ${card.color}40` }}>
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
                {card.trend !== undefined && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${card.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendingUp size={12} className={card.trend < 0 ? 'rotate-180' : ''} />
                    {Math.abs(card.trend)}%
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
              <p className="text-2xl font-display font-bold text-blue-50 mb-1">{card.value}</p>
              {card.subtitle && <p className="text-xs text-slate-500">{card.subtitle}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {stats?.recentActivity && (
        <div className="glass p-5">
          <h3 className="text-sm font-semibold text-blue-100 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                <p className="text-slate-300 flex-1">{activity.description}</p>
                <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleTimeString('pt-BR')}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
