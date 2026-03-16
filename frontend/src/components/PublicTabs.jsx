import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Início' },
  { to: '/alunos', label: 'Alunos' },
  { to: '/professores', label: 'Professores' },
  { to: '/galeria', label: 'Galeria' },
  { to: '/financeiro', label: 'Financeiro' },
  { to: '/rifas', label: 'Rifas' },
  { to: '/contribuidores', label: 'Contribuidores' },
]

export default function PublicTabs({ showBack = true }) {
  const location = useLocation()

  return (
    <div className="glass p-3 md:p-4 flex flex-col gap-3">
      {showBack && location.pathname !== '/' && (
        <div>
          <Link to="/" className="btn-ghost text-sm">
            <ChevronLeft size={15}/>
            Voltar ao início
          </Link>
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {LINKS.map(link => {
          const active = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? 'bg-blue-500/20 text-blue-100 border border-blue-300/20' : 'bg-slate-900/35 text-slate-300 border border-blue-300/10 hover:text-blue-100 hover:bg-blue-500/10'}`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
