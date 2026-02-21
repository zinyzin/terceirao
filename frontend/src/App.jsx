// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import PublicPage from './pages/PublicPage'
import AdminLayout from './pages/AdminLayout'
import DashPage from './pages/DashPage'
import StudentsPage from './pages/StudentsPage'
import ContributorsPage from './pages/ContributorsPage'
import FinancePage from './pages/FinancePage'
import RafflesPage from './pages/RafflesPage'
import ProductsPage from './pages/ProductsPage'
import UsersPage from './pages/UsersPage'
import AuditPage from './pages/AuditPage'

function Guard({ children, role }) {
  const { isAuth, isAdmin, isSA } = useAuthStore()
  if (!isAuth) return <Navigate to="/" replace/>
  if (role === 'admin' && !isAdmin()) return <Navigate to="/dash" replace/>
  if (role === 'superadmin' && !isSA()) return <Navigate to="/dash" replace/>
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage/>}/>
        <Route path="/" element={<Guard><AdminLayout/></Guard>}>
          <Route path="dash" element={<Guard role="admin"><DashPage/></Guard>}/>
          <Route path="students" element={<Guard role="admin"><StudentsPage/></Guard>}/>
          <Route path="contributors" element={<Guard role="admin"><ContributorsPage/></Guard>}/>
          <Route path="finance" element={<Guard role="admin"><FinancePage/></Guard>}/>
          <Route path="products" element={<Guard role="admin"><ProductsPage/></Guard>}/>
          <Route path="raffles" element={<Guard role="admin"><RafflesPage/></Guard>}/>
          <Route path="users" element={<Guard role="superadmin"><UsersPage/></Guard>}/>
          <Route path="audit" element={<Guard role="superadmin"><AuditPage/></Guard>}/>
        </Route>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
