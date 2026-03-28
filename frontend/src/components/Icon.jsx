import { createElement } from 'react'
import * as LucideIcons from 'lucide-react'

const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
}

export function Icon({ 
  name, 
  size = 'md', 
  className = '', 
  color,
  strokeWidth = 2,
  ...props 
}) {
  const LucideIcon = LucideIcons[name]
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icons`)
    return null
  }

  const sizeValue = typeof size === 'number' ? size : iconSizes[size]

  return createElement(LucideIcon, {
    size: sizeValue,
    className,
    color,
    strokeWidth,
    ...props,
  })
}

// Pre-defined common icons for the app
export const AppIcons = {
  // Navigation
  home: 'Home',
  dashboard: 'LayoutDashboard',
  students: 'Users',
  teachers: 'GraduationCap',
  finance: 'DollarSign',
  raffles: 'Ticket',
  contributors: 'Trophy',
  products: 'Package',
  users: 'Shield',
  audit: 'ClipboardList',
  
  // Actions
  add: 'Plus',
  edit: 'Edit2',
  delete: 'Trash2',
  save: 'Save',
  cancel: 'X',
  close: 'X',
  search: 'Search',
  filter: 'Filter',
  sort: 'ArrowUpDown',
  download: 'Download',
  upload: 'Upload',
  refresh: 'RefreshCw',
  
  // Status
  success: 'CheckCircle',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',
  loading: 'Loader2',
  
  // UI
  menu: 'Menu',
  settings: 'Settings',
  theme: 'Palette',
  moon: 'Moon',
  sun: 'Sun',
  bell: 'Bell',
  user: 'User',
  logout: 'LogOut',
  login: 'LogIn',
  eye: 'Eye',
  eyeOff: 'EyeOff',
  chevronDown: 'ChevronDown',
  chevronUp: 'ChevronUp',
  chevronLeft: 'ChevronLeft',
  chevronRight: 'ChevronRight',
}

// Helper to get icon by app icon name
export function AppIcon({ name, ...props }) {
  const iconName = AppIcons[name] || name
  return <Icon name={iconName} {...props} />
}

export default Icon
