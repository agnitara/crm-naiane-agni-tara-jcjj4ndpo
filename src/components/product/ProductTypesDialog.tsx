import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getProductTypes,
  createProductType,
  deleteProductType,
  ProductType,
} from '@/services/productTypes'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ProductTypesDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [types, setTypes] = useState<ProductType[]>([])
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchTypes = async () => {
    try {
      setLoading(true)
      const data = await getProductTypes()
      setTypes(data)
    } catch (e) {
      toast.error('Erro ao carregar tipos de produtos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) fetchTypes()
  }, [isOpen])

  const handleAdd = async () => {
    if (!name) return
    try {
      await createProductType({ name, default_value: Number(value) || 0 })
      toast.success('Tipo de produto adicionado')
      setName('')
      setValue('')
      fetchTypes()
    } catch (e) {
      toast.error('Erro ao adicionar tipo de produto. Pode já existir.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProductType(id)
      toast.success('Tipo de produto removido')
      fetchTypes()
    } catch (e) {
      toast.error('Erro ao remover tipo de produto')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Catálogo de Produtos</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 items-end mt-4">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Nome do Produto (ex: Mentoria)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="w-32 space-y-1">
            <Input
              type="number"
              placeholder="Valor (R$)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd} size="icon" className="shrink-0 shadow-elevation">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="border rounded-md mt-4 max-h-[300px] overflow-auto shadow-subtle bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Valor Padrão</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : types.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhum tipo cadastrado. Adicione seu primeiro produto acima.
                  </TableCell>
                </TableRow>
              ) : (
                types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(t.default_value)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
