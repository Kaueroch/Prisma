import { User, Palette, Download, LogOut, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '../auth/AuthContext'

export function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-8">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24 border-2 border-border">
          <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">{user?.name || 'Usuário'}</h2>
          <p className="text-muted-foreground text-sm">{user?.email || ''}</p>
        </div>
      </div>

      <div>
        <h3 className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-3 pl-1">Preferências</h3>
        <Card>
          <CardContent className="p-0">
            <button className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium">Aparência</span>
              <span className="text-muted-foreground text-sm">Escuro</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium">Gerenciar Categorias</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-3 pl-1">Conta & Dados</h3>
        <Card>
          <CardContent className="p-0">
            <button className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium">Exportar Dados</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <span className="flex-1 text-left font-medium text-destructive">Sair</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
