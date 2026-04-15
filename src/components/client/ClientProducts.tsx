import { useState, useEffect, useRef } from 'react'
import { Product, Stage, Document } from '@/lib/types'
import { useCRM } from '@/contexts/CRMContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Download,
  Calendar as CalIcon,
  DollarSign,
  Upload,
  Trash2,
  Edit2,
  Loader2,
  Plus,
} from 'lucide-react'
import {
  getProductDocumentsByClient,
  uploadProductDocument,
  deleteProductDocument,
  updateProduct,
  deleteProduct,
} from '@/services/products'
import { toast } from 'sonner'
import { ProductDialog } from './ProductDialog'

const stageColors: Record<Stage, string> = {
  Interesse: 'bg-slate-100 text-slate-700',
  Proposta: 'bg-blue-100 text-blue-700',
  Negociação: 'bg-orange-100 text-orange-700',
  Fechado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Entregue: 'bg-purple-100 text-purple-700',
  Upsell: 'bg-pink-100 text-pink-700',
}

export function ClientProducts({ products, clientId }: { products: Product[]; clientId: string }) {
  const { refreshProducts, updateProductStage: updateLocalStage } = useCRM()
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [targetProductId, setTargetProductId] = useState<string | null>(null)

  const fetchDocs = async () => {
    try {
      const docs = await getProductDocumentsByClient(clientId)
      setDocuments(
        docs.map((d: any) => ({
          id: d.id,
          productId: d.product_id,
          name: d.name,
          url: d.url,
          uploadedAt: d.created_at,
          type: d.type,
          size: d.size,
        })),
      )
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [clientId])

  const handleStageChange = async (productId: string, newStage: Stage) => {
    try {
      await updateProduct(productId, { stage: newStage })
      updateLocalStage(productId, newStage)
      toast.success(`Status atualizado para ${newStage}`)
      refreshProducts()
    } catch (e) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    try {
      await deleteProduct(productId)
      toast.success('Produto excluído com sucesso')
      refreshProducts()
    } catch (e) {
      toast.error('Erro ao excluir produto')
    }
  }

  const handleDeleteDoc = async (id: string, url: string) => {
    if (!confirm('Excluir este documento?')) return
    try {
      await deleteProductDocument(id, url)
      toast.success('Documento excluído')
      fetchDocs()
    } catch (e) {
      toast.error('Erro ao excluir')
    }
  }

  const triggerUpload = (productId: string) => {
    setTargetProductId(productId)
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !targetProductId) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo deve ter no máximo 10MB')
      return
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
      toast.error('Tipo de arquivo não permitido')
      return
    }

    try {
      setUploadingProductId(targetProductId)
      await uploadProductDocument(targetProductId, file)
      toast.success('Documento enviado com sucesso')
      fetchDocs()
    } catch (err) {
      toast.error('Erro ao salvar documento')
    } finally {
      setUploadingProductId(null)
      setTargetProductId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const totalValue = products.reduce((acc, p) => acc + Number(p.value), 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border">
        <div>
          <span className="text-xs font-semibold uppercase text-muted-foreground block mb-0.5">
            Valor Total do Cliente
          </span>
          <span className="font-bold text-sm text-emerald-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              totalValue,
            )}
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingProduct(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Novo Produto
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.xls,.xlsx"
      />

      {products.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-lg bg-card text-sm">
          Nenhum produto cadastrado.
        </div>
      ) : (
        products.map((product) => {
          const prodDocs = documents.filter((d) => d.productId === product.id)

          return (
            <Card key={product.id} className="shadow-sm border overflow-hidden group">
              <CardContent className="p-0">
                <div className="p-4 bg-card hover:bg-muted/10 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4
                      className="font-semibold text-sm line-clamp-1 flex-1 pr-2"
                      title={product.name}
                    >
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${stageColors[product.stage]}`}
                      >
                        {product.stage}
                      </Badge>
                      <button
                        onClick={() => {
                          setEditingProduct(product)
                          setIsDialogOpen(true)
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
                    <span className="text-xs font-medium">Status do Funil:</span>
                    <Select
                      value={product.stage}
                      onValueChange={(val) => handleStageChange(product.id, val as Stage)}
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

                <div className="bg-muted/30 p-3 flex flex-col gap-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Documentos Anexos
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-2 gap-1"
                      onClick={() => triggerUpload(product.id)}
                      disabled={uploadingProductId === product.id}
                    >
                      {uploadingProductId === product.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}{' '}
                      Anexar
                    </Button>
                  </div>

                  {prodDocs.length === 0 && (
                    <div className="text-[10px] text-muted-foreground italic">
                      Sem documentos anexados
                    </div>
                  )}

                  {prodDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-background p-2 rounded border border-border/50 text-xs"
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 overflow-hidden hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </a>
                      <div className="flex items-center gap-1">
                        <a
                          href={doc.url}
                          download
                          className="text-muted-foreground hover:text-primary p-1 shrink-0"
                        >
                          <Download className="h-3 w-3" />
                        </a>
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.url)}
                          className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        clientId={clientId}
        onSuccess={refreshProducts}
      />
    </div>
  )
}
