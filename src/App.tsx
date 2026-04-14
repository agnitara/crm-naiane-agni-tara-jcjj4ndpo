import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CRMProvider } from '@/contexts/CRMContext'

import Layout from './components/Layout'
import Index from './pages/Index'
import ClientList from './pages/ClientList'
import ClientProfile from './pages/ClientProfile'
import CalendarPage from './pages/CalendarPage'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <CRMProvider>
        <Toaster />
        <Sonner position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/clientes" element={<ClientList />} />
            <Route path="/clientes/:id" element={<ClientProfile />} />
            <Route
              path="/produtos"
              element={
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl m-4">
                  Página de Gestão Global de Produtos (Em Breve)
                </div>
              }
            />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/configuracoes" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CRMProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
