import { useCRM } from '@/contexts/CRMContext'
import { ClientSidePanel } from './ClientSidePanel'

export function ClientSidePanelWrapper() {
  const { selectedClientId, closeClientPanel } = useCRM()

  return (
    <ClientSidePanel
      clientId={selectedClientId}
      isOpen={!!selectedClientId}
      onClose={closeClientPanel}
    />
  )
}
