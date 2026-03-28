import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { tokens } from './tokens'

const buttonVariants = {
  primary: {
    base: 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border border-blue-400/50',
    hover: 'hover:from-blue-500 hover:to-sky-400 hover:shadow-lg hover:shadow-blue-500/25',
    active: 'active:scale-95',
  },
  secondary: {
    base: 'bg-surface text-text border border-border',
    hover: 'hover:bg-surface-hover hover:border-primary/50',
    active: 'active:scale-95',
  },
  ghost: {
    base: 'bg-transparent text-text-soft border border-transparent',
    hover: 'hover:bg-surface hover:text-text',
    active: 'active:scale-95',
  },
  danger: {
    base: 'bg-gradient-to-r from-red-700 to-red-600 text-white border border-red-400/50',
    hover: 'hover:from-red-600 hover:to-red-500 hover:shadow-lg hover:shadow-red-500/25',
    active: 'active:scale-95',
  },
  success: {
    base: 'bg-gradient-to-r from-green-600 to-emerald-500 text-white border border-green-400/50',
    hover: 'hover:from-green-500 hover:to-emerald-400 hover:shadow-lg hover:shadow-green-500/25',
    active: 'active:scale-95',
  },
}

const buttonSizes = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2',
  xl: 'px-8 py-3 text-lg gap-3',
}

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  animate = true,
  ...props
}, ref) => {
  const variantStyles = buttonVariants[variant]
  const sizeStyles = buttonSizes[size]
  
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-lg
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-bg-primary
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
    ${variantStyles.base}
    ${variantStyles.hover}
    ${variantStyles.active}
    ${sizeStyles}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  const content = (
    <>
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  )

  if (animate) {
    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={isDisabled || isLoading}
        whileHover={{ scale: isDisabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <button
      ref={ref}
      className={baseClasses}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {content}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
