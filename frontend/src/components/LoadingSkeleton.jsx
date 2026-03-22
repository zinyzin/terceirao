import { motion } from 'framer-motion'

export function CardSkeleton({ count = 1, className = '' }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className={`glass p-6 ${className}`}
        >
          <div className="animate-pulse space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700/30 rounded w-1/2"></div>
              </div>
              <div className="w-12 h-12 bg-slate-700/40 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-700/30 rounded"></div>
              <div className="h-3 bg-slate-700/30 rounded w-5/6"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              {[...Array(cols)].map((_, i) => (
                <th key={i}>
                  <div className="h-4 bg-slate-700/40 rounded w-20 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIdx) => (
              <tr key={rowIdx}>
                {[...Array(cols)].map((_, colIdx) => (
                  <td key={colIdx}>
                    <div className="h-3 bg-slate-700/30 rounded animate-pulse" style={{ animationDelay: `${(rowIdx * cols + colIdx) * 50}ms` }}></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="glass p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-slate-700/50 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-3 bg-slate-700/30 rounded w-1/2"></div>
          <div className="h-3 bg-slate-700/30 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )
}
