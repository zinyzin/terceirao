import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
}

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
}

export function PageTransition({ children, mode = 'wait' }) {
  const location = useLocation()
  
  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Stagger container for lists
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.05,
  className = '' 
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger item for use inside StaggerContainer
export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
          }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Fade in on scroll
export function ScrollReveal({ 
  children, 
  className = '',
  delay = 0,
  direction = 'up',
  distance = 30
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState(null)

  useEffect(() => {
    if (!ref) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref])

  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }

  return (
    <motion.div
      ref={setRef}
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      animate={isVisible ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : {}}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Hover scale effect wrapper
export function HoverScale({ 
  children, 
  className = '',
  scale = 1.02
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated number counter
export function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1 }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  )
}
