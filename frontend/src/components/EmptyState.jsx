import { motion } from 'framer-motion'
import { Icon } from './Icon'

export function EmptyState({ 
  icon = 'Inbox',
  title = 'Nenhum dado encontrado',
  description = 'Parece que ainda não há nada aqui.',
  action,
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
        <Icon name={icon} size="xl" className="text-text-dim" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-soft max-w-sm mb-4">{description}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  )
}

export function ErrorState({
  title = 'Algo deu errado',
  description = 'Ocorreu um erro ao carregar os dados.',
  onRetry,
  className = ''
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-4">
        <Icon name="AlertCircle" size="xl" className="text-error" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-soft max-w-sm mb-4">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-ghost"
        >
          <Icon name="RefreshCw" size="sm" />
          Tentar novamente
        </button>
      )}
    </motion.div>
  )
}

export function LoadingState({ 
  message = 'Carregando...',
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
      />
      <p className="mt-4 text-sm text-text-soft">{message}</p>
    </div>
  )
}
