// src/pages/ReportsPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, DollarSign, Users, Package, TrendingUp } from 'lucide-react'
import api from '../lib/api'

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const downloadReport = async (type) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const url = `/api/reports/${type}?${params.toString()}`
      const response = await api.get(url, { responseType: 'blob' })
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (e) {
      alert('Erro ao gerar relatório. Tente novamente.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const reports = [
    {
      id: 'financial',
      title: 'Relatório Financeiro',
      description: 'Resumo completo de entradas, saídas, saldo e maiores contribuidores.',
      icon: DollarSign,
      color: '#00ff88',
      requiresDate: true
    },
    {
      id: 'students',
      title: 'Relatório de Alunos',
      description: 'Lista completa de alunos com contribuições, tickets e vitórias em rifas.',
      icon: Users,
      color: '#60a5fa',
      requiresDate: false
    },
    {
      id: 'products',
      title: 'Relatório de Vendas',
      description: 'Detalhamento de vendas por produto, receita e histórico.',
      icon: Package,
      color: '#ff9900',
      requiresDate: false
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-blue-300"/>
          <h1 className="stitle">Relatórios PDF</h1>
        </div>
      </div>

      <p className="text-xs text-slate-400 font-mono">
        Gere relatórios completos em PDF para análise e documentação.
      </p>

      {/* Date Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-slate-400"/>
          <h2 className="font-display text-sm font-semibold text-blue-100">Filtro de Período (Opcional)</h2>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="text-xs text-slate-400 block mb-1">De</label>
            <input 
              type="date" 
              className="inp text-sm py-1 px-2"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Até</label>
            <input 
              type="date" 
              className="inp text-sm py-1 px-2"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate) && (
            <button 
              className="text-xs text-slate-400 hover:text-blue-300 mt-5"
              onClick={() => { setStartDate(''); setEndDate('') }}
            >
              Limpar
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          * O filtro de período afeta apenas o relatório financeiro
        </p>
      </motion.div>

      {/* Reports Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${report.color}15`, border: `1px solid ${report.color}30` }}
              >
                <report.icon size={24} style={{ color: report.color }}/>
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-blue-100">{report.title}</h3>
                {report.requiresDate && (startDate || endDate) && (
                  <p className="text-xs text-green-400">Período filtrado</p>
                )}
              </div>
            </div>
            
            <p className="text-xs text-slate-400 flex-1">{report.description}</p>
            
            <button
              className="btn-g w-full justify-center text-xs mt-2"
              onClick={() => downloadReport(report.id)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <TrendingUp size={14} className="animate-spin"/> Gerando...
                </>
              ) : (
                <>
                  <Download size={14}/> Baixar PDF
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Info Card */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass p-4 border-l-4 border-blue-500"
      >
        <p className="text-xs text-slate-400">
          <strong className="text-blue-200">Nota:</strong> Os relatórios são gerados em tempo real e incluem todos os dados até o momento do download. 
          Relatórios financeiros podem ser filtrados por período para análises específicas.
        </p>
      </motion.div>
    </div>
  )
}
