import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const cardVariants = {
  default: {
    base: 'glass',
    hover: 'hover:transform hover:-translate-y-1',
  },
  flat: {
    base: 'bg-surface border border-border rounded-2xl',
    hover: 'hover:bg-surface-hover',
  },
  elevated: {
    base: 'bg-surface border border-border rounded-2xl shadow-xl',
    hover: 'hover:shadow-2xl hover:-translate-y-1',
  },
  interactive: {
    base: 'glass cursor-pointer',
    hover: 'hover:transform hover:-translate-y-1.5 hover:scale-[1.02]',
  },
}

const Card = forwardRef(({
  children,
  variant = 'default',
  padding = '6',
  animate = false,
  onClick,
  className = '',
  ...props
}, ref) => {
  const variantStyles = cardVariants[variant]
  
  const baseClasses = `
    relative overflow-hidden
    ${variantStyles.base}
    ${variantStyles.hover}
    p-${padding}
    transition-all duration-300 ease-out
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={onClick ? { y: -6, scale: 1.02 } : { y: -3 }}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      ref={ref}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// Card sub-components
Card.Header = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
)

Card.Title = ({ children, className = '' }) => (
  <h3 className={`font-display font-bold text-lg text-text ${className}`}>
    {children}
  </h3>
)

Card.Description = ({ children, className = '' }) => (
  <p className={`text-sm text-text-soft mt-1 ${className}`}>
    {children}
  </p>
)

Card.Content = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
)

Card.Footer = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-border/50 flex items-center gap-2 ${className}`}>
    {children}
  </div>
)

export default Card
