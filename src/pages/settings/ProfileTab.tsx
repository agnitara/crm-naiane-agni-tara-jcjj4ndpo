import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Save } from 'lucide-react'

export function ProfileTab() {
  return (
    <Card className="shadow-subtle border-none">
      <CardHeader>
        <CardTitle className="font-display">Perfil da Mentora</CardTitle>
        <CardDescription>Informações públicas exibidas nos contratos e convites.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border">
            <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=99" />
            <AvatarFallback>NA</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            Mudar Foto
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" defaultValue="Naiane Agni Tara" className="bg-muted/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Profissional</Label>
            <Input id="email" defaultValue="contato@naianeagni.com" className="bg-muted/30" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Assinatura / Título</Label>
            <Input
              id="bio"
              defaultValue="Mentora e Consultora Estratégica"
              className="bg-muted/30"
            />
          </div>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" /> Salvar Alterações
        </Button>
      </CardContent>
    </Card>
  )
}
