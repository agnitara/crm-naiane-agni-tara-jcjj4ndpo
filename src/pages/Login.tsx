import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Mail } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Por favor, insira um email válido'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const { signInWithOtp, signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  })

  useEffect(() => {
    // Handle mock URL parameters for testing specific error scenarios (e.g., expired Magic Link)
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'expired') {
      toast.error('Seu link expirou. Solicite um novo')
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    const { error } = await signInWithOtp(data.email)
    setIsLoading(false)

    if (error) {
      toast.error('Erro ao enviar link. Tente novamente.')
    } else {
      toast.success('Link de login enviado! Verifique sua caixa de entrada.')
      form.reset()
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      toast.error('Erro ao autenticar com Google.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-elevation border-none">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display font-bold">Acesso Seguro</CardTitle>
          <CardDescription>Entre no Agni CRM usando seu email ou conta Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email de acesso</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                {...form.register('email')}
                className={
                  form.formState.errors.email
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                }
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive animate-fade-in-up">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading || isGoogleLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Enviar Magic Link
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full h-11"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
            )}
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
