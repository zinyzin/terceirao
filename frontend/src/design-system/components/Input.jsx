import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const Input = forwardRef(({
  label,
  error,
  helper,
  size = 'md',
  type = 'text',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const baseClasses = `
    w-full bg-surface-strong border border-border rounded-lg
    text-text placeholder:text-text-dim/50
    transition-all duration-200 ease-out
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
    hover:border-border/80
    disabled:opacity-50 disabled:cursor-not-allowed
    ${inputSizes[size]}
    ${leftIcon ? 'pl-10' : ''}
    ${(rightIcon || isPassword) ? 'pr-10' : ''}
    ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
    ${className}
  `

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className={`block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={baseClasses}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {!isPassword && rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-error"
        >
          {error}
        </motion.p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-xs text-text-dim">
          {helper}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
