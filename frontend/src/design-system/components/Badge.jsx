import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const badgeVariants = {
  primary: 'bg-primary/10 text-primary border-primary/30',
  secondary: 'bg-secondary/10 text-secondary border-secondary/30',
  accent: 'bg-accent/10 text-accent border-accent/30',
  success: 'bg-green-500/10 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/10 text-red-400 border-red-500/30',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  neutral: 'bg-surface text-text-soft border-border',
}

const badgeSizes = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
}

const Badge = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  dotColor,
  animate = false,
  className = '',
  ...props
}, ref) => {
  const variantStyles = badgeVariants[variant]
  const sizeStyles = badgeSizes[size]
  
  const baseClasses = `
    inline-flex items-center gap-1.5
    font-medium rounded-full border
    ${variantStyles}
    ${sizeStyles}
    ${className}
  `

  const dotStyles = dotColor || {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
    info: 'bg-blue-400',
    neutral: 'bg-text-dim',
  }[variant]

  const content = (
    <>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />
      )}
      <span>{children}</span>
    </>
  )

  if (animate) {
    return (
      <motion.span
        ref={ref}
        className={baseClasses}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        {...props}
      >
        {content}
      </motion.span>
    )
  }

  return (
    <span ref={ref} className={baseClasses} {...props}>
      {content}
    </span>
  )
})

Badge.displayName = 'Badge'

export default Badge
