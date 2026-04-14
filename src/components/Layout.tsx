import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/30">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
          <Outlet />
        </main>

        {/* Floating Action Button for Mobile */}
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elevation sm:hidden z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SidebarInset>
    </SidebarProvider>
  )
}
