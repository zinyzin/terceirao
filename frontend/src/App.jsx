// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/auth'
import { useThemeStore } from './store/theme'
import HomePage from './pages/HomePage'
import AdminLayout from './pages/AdminLayout'
import DashPage from './pages/DashPage'
import StudentsPage from './pages/StudentsPage'
import TeachersPage from './pages/TeachersPage'
import ContributorsPage from './pages/ContributorsPage'
import FinancePage from './pages/FinancePage'
import RafflesPage from './pages/RafflesPage'
import UsersPage from './pages/UsersPage'
import AuditPage from './pages/AuditPage'
import ProductsPage from './pages/ProductsPage'
import SettingsPage from './pages/SettingsPage'
import TrashPage from './pages/TrashPage'
import ReportsPage from './pages/ReportsPage'
import EventsPage from './pages/EventsPage'
import AdminGalleryPage from './pages/AdminGalleryPage'
import GalleryPage from './pages/GalleryPage'
import PublicLayout from './pages/PublicLayout'
import ToastContainer from './components/Toast'
import ConfirmModal from './components/ConfirmModal'

function Guard({ children, role }) {
  const { isAuth, isAdmin, isSA } = useAuthStore()
  if (!isAuth) return <Navigate to="/" replace/>
  if (role === 'admin' && !isAdmin()) return <Navigate to="/" replace/>
  if (role === 'superadmin' && !isSA()) return <Navigate to="/" replace/>
  return children
}

function AppInitializer() {
  const { initTheme } = useThemeStore()
  
  useEffect(() => {
    initTheme()
  }, [initTheme])
  
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer />
      <ToastContainer />
      <ConfirmModal />
      <Routes>
        <Route path="/" element={<HomePage/>}/>

        <Route element={<PublicLayout/>}>
          <Route path="/alunos" element={<StudentsPage/>}/>
          <Route path="/professores" element={<TeachersPage/>}/>
          <Route path="/financeiro" element={<FinancePage/>}/>
          <Route path="/rifas" element={<RafflesPage/>}/>
          <Route path="/contribuidores" element={<ContributorsPage/>}/>
          <Route path="/galeria" element={<GalleryPage/>}/>
          <Route path="/eventos" element={<EventsPage/>}/>
        </Route>
        <Route path="/students" element={<Navigate to="/alunos" replace/>}/>
        <Route path="/teachers" element={<Navigate to="/professores" replace/>}/>
        <Route path="/finance" element={<Navigate to="/financeiro" replace/>}/>
        <Route path="/raffles" element={<Navigate to="/rifas" replace/>}/>
        <Route path="/contributors" element={<Navigate to="/contribuidores" replace/>}/>
        <Route path="/events" element={<Navigate to="/eventos" replace/>}/>

        <Route path="/admin" element={<Guard role="admin"><AdminLayout/></Guard>}>
          <Route index element={<Navigate to="dash" replace/>}/>
          <Route path="dash" element={<DashPage/>}/>
          <Route path="alunos" element={<StudentsPage/>}/>
          <Route path="professores" element={<TeachersPage/>}/>
          <Route path="contribuidores" element={<ContributorsPage/>}/>
          <Route path="financeiro" element={<FinancePage/>}/>
          <Route path="produtos" element={<ProductsPage/>}/>
          <Route path="rifas" element={<RafflesPage/>}/>
          <Route path="settings" element={<Guard role="superadmin"><SettingsPage/></Guard>}/>
          <Route path="trash" element={<Guard role="superadmin"><TrashPage/></Guard>}/>
          <Route path="reports" element={<Guard role="admin"><ReportsPage/></Guard>}/>
          <Route path="events" element={<Guard role="admin"><EventsPage/></Guard>}/>
          <Route path="galeria" element={<Guard role="admin"><AdminGalleryPage/></Guard>}/>
          <Route path="users" element={<Guard role="superadmin"><UsersPage/></Guard>}/>
          <Route path="audit" element={<Guard role="superadmin"><AuditPage/></Guard>}/>
        </Route>

        <Route path="/dash" element={<Navigate to="/admin/dash" replace/>}/>
        <Route path="/products" element={<Navigate to="/admin/produtos" replace/>}/>
        <Route path="/users" element={<Navigate to="/admin/users" replace/>}/>
        <Route path="/audit" element={<Navigate to="/admin/audit" replace/>}/>

        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
