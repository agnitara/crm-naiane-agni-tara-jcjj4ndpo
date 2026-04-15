import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export function StepSend({ sendResults, isSending }: any) {
  const successCount = sendResults.filter((r: any) => r.status === 'success').length
  const errorCount = sendResults.filter((r: any) => r.status === 'error').length
  const totalCount = sendResults.length
  const progress = totalCount === 0 ? 0 : ((successCount + errorCount) / totalCount) * 100

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="font-semibold text-lg">Status do Envio</h3>
            <p className="text-sm text-muted-foreground">
              {isSending ? 'Enviando mensagens...' : 'Envio finalizado'}
            </p>
          </div>
          <div className="text-right">
            <div className="font-medium text-2xl font-display">
              {successCount} / {totalCount}
            </div>
            <div className="text-xs text-muted-foreground">Entregues com sucesso</div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <ScrollArea className="flex-1 border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sendResults.map((result: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{result.clientName}</TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {result.platform}
                </TableCell>
                <TableCell>
                  {result.status === 'pending' && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-500/10 text-blue-600 border-blue-500/20"
                    >
                      <Loader2 className="w-3 h-3 animate-spin mr-1" /> Pendente
                    </Badge>
                  )}
                  {result.status === 'success' && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Enviado
                    </Badge>
                  )}
                  {result.status === 'error' && (
                    <Badge
                      variant="secondary"
                      className="bg-red-500/10 text-red-600 border-red-500/20"
                      title={result.error}
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Falha
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {result.time || '-'}
                </TableCell>
              </TableRow>
            ))}
            {sendResults.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Aguardando inicialização do envio...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
