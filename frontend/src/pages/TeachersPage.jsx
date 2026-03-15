// src/pages/TeachersPage.jsx
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../components/Modal'
import ForestBg from '../components/ForestBg'
import { useAuthStore } from '../store/auth'

export default function TeachersPage() {
  const { isAuth, can } = useAuthStore()
  const isAllowed = isAuth && can('teachers:edit')

  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)

  const teachers = useMemo(() => ([
    {
      id: 'counselor',
      name: 'Professor Conselheiro',
      subject: 'Orientação',
      catchphrase: 'Vamos com calma que dá certo.',
      bio: 'Uma presença essencial durante o ano. Sempre puxando a turma para frente, com firmeza e carinho.',
      photo: null,
      counselor: true,
      socials: { instagram: null },
    },
    {
      id: 't1',
      name: 'Professora de Português',
      subject: 'Português',
      catchphrase: 'Interpretação é tudo!',
      bio: 'Obrigada por cada redação corrigida e por ensinar a gente a se expressar melhor.',
      photo: null,
      counselor: false,
      socials: { instagram: null },
    },
    {
      id: 't2',
      name: 'Professor de Matemática',
      subject: 'Matemática',
      catchphrase: 'Sem pressa, sem erro.',
      bio: 'Obrigado por transformar contas em confiança e por nunca desistir da turma.',
      photo: null,
      counselor: false,
      socials: { instagram: null },
    },
  ]), [])

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ForestBg/>

      <main className="page-shell pt-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="stitle">Professores</h1>
            {isAllowed && <span className="badge badge-g">Edição habilitada</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass p-5 cursor-pointer"
                onClick={() => { setSelected(t); setModal('detail') }}
                style={t.counselor ? { borderColor: 'rgba(255,204,0,0.35)', boxShadow: '0 14px 40px rgba(0,0,0,0.55), 0 0 26px rgba(255,204,0,0.08)' } : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-blue-50 text-sm truncate">{t.name}</p>
                    <p className="text-xs text-slate-300 mt-1">Matéria: <span className="text-sky-300">{t.subject}</span></p>
                    {t.counselor && <p className="text-xs text-yellow-400 mt-1 font-semibold">Professor Conselheiro</p>}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900/50 border border-blue-300/20 flex items-center justify-center text-blue-300 font-display font-black">
                    {t.name[0]}
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-3 line-clamp-3">{t.bio}</p>
              </motion.div>
            ))}
          </div>

          <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="">
            {selected && (
              <div>
                <div className="flex justify-center mb-4">
                  {selected.photo
                    ? <img src={selected.photo} className="w-40 h-40 rounded-2xl object-cover border border-blue-300/30"/>
                    : <div className="w-40 h-40 rounded-2xl bg-slate-900/50 flex items-center justify-center font-display text-5xl font-bold text-blue-300">{selected.name[0]}</div>
                  }
                </div>

                <h2 className="font-display text-xl font-bold text-blue-50 text-center">{selected.name}</h2>
                <p className="text-xs text-slate-300 text-center mt-2">Matéria: <span className="text-sky-300">{selected.subject}</span></p>

                {selected.catchphrase && (
                  <div className="mt-5 p-4 rounded-xl surface-muted">
                    <p className="text-xs text-sky-200/70 uppercase tracking-wider mb-2">Bordão</p>
                    <p className="text-sm text-blue-100">“{selected.catchphrase}”</p>
                  </div>
                )}

                {selected.bio && <p className="text-slate-300 text-sm mt-4 whitespace-pre-line">{selected.bio}</p>}

                {isAllowed && (
                  <div className="mt-6 p-4 rounded-xl surface-muted">
                    <p className="text-xs text-slate-400">Edição desta página está mockada no frontend nesta iteração.</p>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </div>
      </main>
    </div>
  )
}
