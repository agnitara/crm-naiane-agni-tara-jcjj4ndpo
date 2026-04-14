import { Product, Stage, Document } from '@/lib/types'
import { useCRM } from '@/contexts/CRMContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Download, Calendar as CalIcon, DollarSign } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const stageColors: Record<Stage, string> = {
  Interesse: 'bg-slate-100 text-slate-700',
  Proposta: 'bg-blue-100 text-blue-700',
  Negociação: 'bg-orange-100 text-orange-700',
  Fechado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Entregue: 'bg-purple-100 text-purple-700',
  Upsell: 'bg-pink-100 text-pink-700',
}

export function ClientProducts({
  products,
  documents,
}: {
  products: Product[]
  documents: Document[]
}) {
  const { updateProductStage } = useCRM()

  if (products.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground border border-dashed rounded-lg bg-card">
        Nenhum produto cadastrado.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const prodDocs = documents.filter((d) => d.productId === product.id)

        return (
          <Card key={product.id} className="shadow-sm border-none overflow-hidden group">
            <CardContent className="p-0">
              <div className="p-4 bg-card hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4
                    className="font-semibold text-sm line-clamp-1 flex-1 pr-2"
                    title={product.name}
                  >
                    {product.name}
                  </h4>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${stageColors[product.stage]}`}
                  >
                    {product.stage}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-primary/70" />
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.value)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalIcon className="h-3.5 w-3.5 text-primary/70" />
                    <span>
                      {new Intl.DateTimeFormat('pt-BR').format(new Date(product.expectedDate))}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-xs font-medium">Status do Pipeline:</span>
                  <Select
                    value={product.stage}
                    onValueChange={(val) => updateProductStage(product.id, val as Stage)}
                  >
                    <SelectTrigger className="h-7 w-[120px] text-xs border-dashed focus:ring-0 focus:ring-offset-0 bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(stageColors).map((stage) => (
                        <SelectItem key={stage} value={stage} className="text-xs">
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {prodDocs.length > 0 && (
                <div className="bg-muted/50 p-3 flex flex-col gap-2 border-t">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Documentos Cofre
                  </span>
                  {prodDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-background p-2 rounded border border-border/50 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                      <button className="text-muted-foreground hover:text-primary p-1 shrink-0">
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
