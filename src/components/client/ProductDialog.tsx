import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Product } from '@/lib/types'
import { createProduct, updateProduct } from '@/services/products'
import { toast } from 'sonner'

const productSchema = z
  .object({
    name: z.string().min(1, 'Nome do produto é obrigatório'),
    value: z.coerce.number().positive('Insira um valor válido (ex: 5000.00)'),
    stage: z.enum(['Interesse', 'Proposta', 'Negociação', 'Fechado', 'Entregue', 'Upsell']),
    startDate: z.string().min(1, 'Data de início é obrigatória'),
    expectedDate: z.string().min(1, 'Data de conclusão é obrigatória'),
  })
  .refine((data) => new Date(data.expectedDate) > new Date(data.startDate), {
    message: 'Data de conclusão deve ser maior que a data de início',
    path: ['expectedDate'],
  })

type ProductFormValues = z.infer<typeof productSchema>

export function ProductDialog({
  isOpen,
  onClose,
  product,
  clientId,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  clientId: string
  onSuccess: () => void
}) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      value: 0,
      stage: 'Interesse',
      startDate: new Date().toISOString().split('T')[0],
      expectedDate: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: product?.name || '',
        value: product?.value || 0,
        stage: product?.stage || 'Interesse',
        startDate: product?.startDate
          ? product.startDate.split('T')[0]
          : new Date().toISOString().split('T')[0],
        expectedDate: product?.expectedDate ? product.expectedDate.split('T')[0] : '',
      })
    }
  }, [isOpen, product, form])

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        expectedDate: new Date(data.expectedDate).toISOString(),
      }
      if (product) {
        await updateProduct(product.id, payload)
        toast.success('Produto atualizado com sucesso')
      } else {
        await createProduct({ ...payload, clientId })
        toast.success('Produto criado com sucesso')
      }
      onSuccess()
      onClose()
    } catch (e) {
      toast.error('Erro ao salvar produto. Tente novamente')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto/Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mentoria Estratégica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Interesse">Interesse</SelectItem>
                        <SelectItem value="Proposta">Proposta</SelectItem>
                        <SelectItem value="Negociação">Negociação</SelectItem>
                        <SelectItem value="Fechado">Fechado</SelectItem>
                        <SelectItem value="Entregue">Entregue</SelectItem>
                        <SelectItem value="Upsell">Upsell</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previsão de Conclusão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
