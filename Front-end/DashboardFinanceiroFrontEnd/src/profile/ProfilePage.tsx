import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { exportLocalData } from '../shared/services/prefsService'
import { useToast } from '../shared/components/Toast'
import {
  User,
  Tags,
  LogOut,
  Save,
  ShieldCheck,
  Download,
  KeyRound,
  Mail,
  ChevronRight,
} from 'lucide-react'

export function ProfilePage({ setActiveTab }: { setActiveTab?: (tab: any) => void }) {
  const { user, logout } = useAuth()
  const { showToast } = useToast()

  const [nome, setNome] = useState(user?.name ?? '')
  const [erroNome, setErroNome] = useState('')
  const [salvandoNome, setSalvandoNome] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const initials =
    user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const salvarNome = async (e: FormEvent) => {
    e.preventDefault()
    setErroNome('')
    if (!nome.trim()) {
      setErroNome('Por favor preencha o nome corretamente.')
      return
    }
    setSalvandoNome(true)
    try {
      showToast('Você atualizou o nome.')
    } finally {
      setSalvandoNome(false)
    }
  }

  const exportar = () => {
    const url = URL.createObjectURL(new Blob([exportLocalData()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'prisma-export.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Você exportou seus dados.')
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6">
      {/* Perfil */}
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24 border-2 border-border">
            <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">{user?.name || 'Usuário'}</h2>
            <p className="text-muted-foreground text-sm">{user?.email || ''}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={salvarNome} className="space-y-4">
              {erroNome && (
                <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  {erroNome}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="perfil-nome" className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Nome
                </Label>
                <Input
                  id="perfil-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={salvandoNome}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar nome
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                Acesso
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                E-mail e senha podem ser alterados abaixo.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">E-mail</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email || ''}</p>
              </div>
              <Button variant="outline" disabled>
                <Mail className="mr-2 h-4 w-4" />
                Trocar e-mail
              </Button>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha atual</Label>
                <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
                <Input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Salvar senha
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conta */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Conta</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Você gerencia seus dados e sua sessão.
          </p>
        </div>
        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => setActiveTab?.('categories')}
              className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors border-b border-border rounded-t-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Tags className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left">
                <span className="block font-medium">Gerenciar Categorias</span>
                <span className="block text-sm text-muted-foreground">Você organiza suas categorias</span>
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={exportar}
              className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors rounded-b-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left">
                <span className="block font-medium">Exportar meus dados</span>
                <span className="block text-sm text-muted-foreground">Você baixa seus dados em JSON</span>
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-3 pl-1">
            Zona de atenção
          </h3>
          <Card className="border-red-500/20">
            <CardContent className="p-0">
              <button
                onClick={logout}
                className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors rounded-2xl"
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
    </div>
  )
}