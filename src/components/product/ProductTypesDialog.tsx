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
  updateProductType,
  deleteProductType,
  ProductType,
} from '@/services/productTypes'
import { Trash2, Plus, Loader2, Edit2, X, Check } from 'lucide-react'
import { toast } from 'sonner'

export function ProductTypesDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [types, setTypes] = useState<ProductType[]>([])
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editValue, setEditValue] = useState('')

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
    if (isOpen) {
      fetchTypes()
      setEditingId(null)
    }
  }, [isOpen])

  const handleAdd = async () => {
    if (!name) return
    try {
      setLoading(true)
      let numericValue = value ? parseFloat(value.toString().replace(',', '.')) : 0
      if (isNaN(numericValue)) numericValue = 0

      const res = await createProductType({ name, default_value: numericValue })
      if (!res.success) {
        toast.error(`Erro ao adicionar: ${res.error}`)
        return
      }
      toast.success('Tipo de produto adicionado')
      setName('')
      setValue('')
      fetchTypes()
    } catch (e: any) {
      console.error('Error adding product type:', e)
      toast.error(`Erro ao adicionar: ${e.message || 'Produto já pode existir.'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName) return
    try {
      setLoading(true)
      let numericValue = editValue ? parseFloat(editValue.toString().replace(',', '.')) : 0
      if (isNaN(numericValue)) numericValue = 0

      const res = await updateProductType(id, { name: editName, default_value: numericValue })
      if (!res.success) {
        toast.error(`Erro ao atualizar: ${res.error}`)
        return
      }
      toast.success('Tipo de produto atualizado')
      setEditingId(null)
      fetchTypes()
    } catch (e: any) {
      console.error('Error updating product type:', e)
      toast.error(`Erro ao atualizar: ${e.message || 'Já pode existir um com esse nome.'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      const res = await deleteProductType(id)
      if (!res.success) {
        toast.error(`Erro ao remover: ${res.error}`)
        return
      }
      toast.success('Tipo de produto removido')
      fetchTypes()
    } catch (e) {
      toast.error('Erro ao remover tipo de produto')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (t: ProductType) => {
    setEditingId(t.id)
    setEditName(t.name)
    setEditValue(t.default_value.toString())
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Catálogo de Produtos</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 items-end mt-4">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Nome do Produto (ex: Mentoria)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="w-32 space-y-1">
            <Input
              type="number"
              step="0.01"
              placeholder="Valor (R$)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
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
                <TableHead className="w-[100px] text-right">Ações</TableHead>
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
                    {editingId === t.id ? (
                      <>
                        <TableCell className="p-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(t.id)}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 w-24"
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(t.id)}
                          />
                        </TableCell>
                        <TableCell className="p-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleUpdate(t.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(t.default_value)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => startEditing(t)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(t.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
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
