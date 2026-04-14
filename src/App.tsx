import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CRMProvider } from '@/contexts/CRMContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

import Layout from './components/Layout'
import Index from './pages/Index'
import ClientList from './pages/ClientList'
import ClientProfile from './pages/ClientProfile'
import ProductList from './pages/ProductList'
import CalendarPage from './pages/CalendarPage'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import Login from './pages/Login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <CRMProvider>
          <Toaster />
          <Sonner position="top-right" />
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Protected App Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/clientes" element={<ClientList />} />
              <Route path="/clientes/:id" element={<ClientProfile />} />
              <Route path="/produtos" element={<ProductList />} />
              <Route path="/calendario" element={<CalendarPage />} />
              <Route path="/configuracoes" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CRMProvider>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
