import { useEffect, useState } from 'react'
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
import { getProductTypes, ProductType } from '@/services/productTypes'
import { getClients } from '@/services/clients'
import { toast } from 'sonner'

const productSchema = z
  .object({
    clientId: z.string().min(1, 'Cliente é obrigatório'),
    name: z.string().min(1, 'Nome do produto é obrigatório'),
    value: z.coerce.number().min(0, 'Insira um valor válido'),
    stage: z.enum(['Interesse', 'Proposta', 'Negociação', 'Fechado', 'Entregue', 'Upsell']),
    startDate: z.string().min(1, 'Data de início é obrigatória'),
    expectedDate: z.string().min(1, 'Data de conclusão é obrigatória'),
  })
  .refine((data) => new Date(data.expectedDate) >= new Date(data.startDate), {
    message: 'Data de conclusão deve ser maior ou igual à data de início',
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
  clientId?: string
  onSuccess: () => void
}) {
  const [types, setTypes] = useState<ProductType[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      clientId: clientId || '',
      name: '',
      value: 0,
      stage: 'Interesse',
      startDate: new Date().toISOString().split('T')[0],
      expectedDate: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      getProductTypes().then(setTypes).catch(console.error)
      if (!clientId && !product) {
        getClients().then(setClients).catch(console.error)
      }

      form.reset({
        clientId: product?.clientId || clientId || '',
        name: product?.name || '',
        value: product?.value || 0,
        stage: product?.stage || 'Interesse',
        startDate: product?.startDate
          ? product.startDate.split('T')[0]
          : new Date().toISOString().split('T')[0],
        expectedDate: product?.expectedDate ? product.expectedDate.split('T')[0] : '',
      })
    }
  }, [isOpen, product, clientId, form])

  const handleTypeSelect = (typeId: string) => {
    if (typeId === 'custom') {
      form.setValue('name', '')
      form.setValue('value', 0)
      return
    }
    const t = types.find((x) => x.id === typeId)
    if (t) {
      form.setValue('name', t.name)
      form.setValue('value', t.default_value)
    }
  }

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
        await createProduct(payload)
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
            {!clientId && !product && (
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!product && types.length > 0 && (
              <FormItem>
                <FormLabel>Preencher via Catálogo (Opcional)</FormLabel>
                <Select onValueChange={handleTypeSelect}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar do catálogo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="custom">Personalizado (em branco)</SelectItem>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}

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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormLabel>Previsão</FormLabel>
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
