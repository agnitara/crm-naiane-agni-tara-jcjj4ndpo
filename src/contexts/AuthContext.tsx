import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

type User = {
  id: string
  email: string
}

type Session = {
  access_token: string
  user: User
  expires_at: number
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check local storage for session management (simulating Supabase/Auth token persistence)
    const stored = localStorage.getItem('crm_session')
    if (stored) {
      try {
        const parsed: Session = JSON.parse(stored)
        // Check if session has expired (7 days simulated limit)
        if (parsed.expires_at < Date.now()) {
          localStorage.removeItem('crm_session')
          setSession(null)
          if (location.pathname !== '/login') {
            toast.error('Sua sessão expirou')
            navigate('/login')
          }
        } else {
          setSession(parsed)
        }
      } catch {
        localStorage.removeItem('crm_session')
        setSession(null)
      }
    }
    setLoading(false)
  }, [navigate, location.pathname])

  const signInWithOtp = async (email: string) => {
    // Simulate API delay for magic link logic
    await new Promise((r) => setTimeout(r, 1500))
    // Return success
    return { error: null }
  }

  const signInWithGoogle = async () => {
    // Simulate OAuth flow
    await new Promise((r) => setTimeout(r, 800))
    const newSession: Session = {
      access_token: 'mock_token_' + Date.now(),
      user: { id: 'user_' + Math.random().toString(36).substr(2, 9), email: 'naiane@example.com' },
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    }
    localStorage.setItem('crm_session', JSON.stringify(newSession))
    setSession(newSession)
    navigate('/dashboard')
  }

  const signOut = async () => {
    localStorage.removeItem('crm_session')
    setSession(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signInWithOtp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
