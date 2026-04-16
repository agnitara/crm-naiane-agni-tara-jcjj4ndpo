import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getProducts } from '@/services/products'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, ArrowRight, PackageSearch, Loader2, Settings, Plus, Edit2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductDialog } from '@/components/client/ProductDialog'
import { ProductTypesDialog } from '@/components/product/ProductTypesDialog'

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isTypesOpen, setIsTypesOpen] = useState(false)
  const [isNewProductOpen, setIsNewProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const result = await getProducts()
      if (result.success) {
        setProducts(result.data || [])
      } else {
        console.error('Error fetching products:', result.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.clients?.name?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || product.stage === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [products, search, statusFilter])

  const stages = useMemo(() => {
    const uniqueStages = new Set(products.map((p) => p.stage))
    return Array.from(uniqueStages).filter(Boolean)
  }, [products])

  const totalValue = filteredProducts.reduce(
    (acc, product) => acc + (Number(product.value) || 0),
    0,
  )

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Gestão de Produtos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie o catálogo de produtos e os contratos ativos dos seus clientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsTypesOpen(true)} className="shadow-subtle">
            <Settings className="mr-2 h-4 w-4" /> Catálogo
          </Button>
          <Button onClick={() => setIsNewProductOpen(true)} className="shadow-elevation">
            <Plus className="mr-2 h-4 w-4" /> Novo Registro
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <span className="text-xl text-muted-foreground">R$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                totalValue,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por produto ou cliente..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {stages.map((stage) => (
              <SelectItem key={stage as string} value={stage as string}>
                {stage as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="rounded-md border border-border/50">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={product.clients?.avatar || ''} />
                          <AvatarFallback>
                            {product.clients?.name?.substring(0, 2).toUpperCase() || 'CL'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{product.clients?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(product.value))}
                    </TableCell>
                    <TableCell>
                      {product.start_date
                        ? format(new Date(product.start_date), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {product.expected_date
                        ? format(new Date(product.expected_date), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProduct({
                              id: product.id,
                              clientId: product.client_id,
                              name: product.name,
                              value: product.value,
                              stage: product.stage,
                              startDate: product.start_date,
                              expectedDate: product.expected_date,
                            })
                          }}
                          title="Editar Produto"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {product.clients?.id && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/clientes/${product.clients.id}`}>
                              Ver Cliente <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ProductTypesDialog isOpen={isTypesOpen} onClose={() => setIsTypesOpen(false)} />
      <ProductDialog
        isOpen={isNewProductOpen || !!editingProduct}
        onClose={() => {
          setIsNewProductOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        onSuccess={fetchProducts}
      />
    </div>
  )
}
