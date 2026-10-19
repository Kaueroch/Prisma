import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useFinance } from '../finance/useFinance'
import type { MonthFilter } from '../shared/types'
import { matchesMonthFilter, formatMonthFilter, formatDateBR, formatBRL } from '../shared/utils/formatters'

export function ProfilePage({ setActiveTab }: { setActiveTab?: (tab: any) => void }) {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const { expenses, categories } = useFinance()

  const [exportOpen, setExportOpen] = useState(false)
  const [exportType, setExportType] = useState<'all' | 'income' | 'expense'>('all')
  const [exportPeriod, setExportPeriod] = useState<MonthFilter>({ month: new Date().getMonth(), year: new Date().getFullYear(), all: false })
  const [exportAllMonths, setExportAllMonths] = useState(false)
  const [exportFilename, setExportFilename] = useState(`prisma-relatorio-${new Date().toISOString().slice(0, 7)}`)

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
    const period: MonthFilter = exportAllMonths
      ? { month: exportPeriod.month, year: exportPeriod.year, all: true }
      : { month: exportPeriod.month, year: exportPeriod.year, all: false }

    const filtered = expenses.filter((e: any) => {
      if (exportType !== 'all' && e.type !== exportType) return false
      return matchesMonthFilter(e.date, period)
    })

    const catName = (id: any) => categories.find((c: any) => String(c.id) === String(id))?.name || 'Sem categoria'

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Relatório Prisma', 14, 16)
    doc.setFontSize(10)
    doc.text(`Período: ${exportAllMonths ? 'Todos os meses' : formatMonthFilter(period)}`, 14, 23)
    doc.text(`Tipo: ${exportType === 'all' ? 'Todos' : exportType === 'income' ? 'Receitas' : 'Despesas'}`, 14, 29)
    doc.text(`Exportado em: ${new Date().toLocaleString('pt-BR')}`, 14, 35)

    const rows = filtered
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((e: any) => [
        formatDateBR(e.date),
        e.type === 'income' ? 'Receita' : 'Despesa',
        String(e.name || ''),
        String(catName(e.categoryId)),
        formatBRL(e.amount),
      ])

    autoTable(doc, {
      head: [['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor (R$)']],
      body: rows,
      startY: 42,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [251, 191, 36], textColor: [0, 0, 0] },
    })

    const receitas = filtered.filter((e: any) => e.type === 'income').reduce((s: number, e: any) => s + (e.amount || 0), 0)
    const despesas = filtered.filter((e: any) => e.type === 'expense').reduce((s: number, e: any) => s + (e.amount || 0), 0)
    const finalY = (doc as any).lastAutoTable?.finalY || 42
    doc.text(`Receitas: ${formatBRL(receitas)}`, 14, finalY + 8)
    doc.text(`Despesas: ${formatBRL(despesas)}`, 14, finalY + 14)
    doc.text(`Saldo: ${formatBRL(receitas - despesas)}`, 14, finalY + 20)

    doc.save(`${exportFilename || 'prisma-relatorio'}.pdf`)
    setExportOpen(false)
    showToast('Relatório PDF exportado.')
  }

  return (
    <>
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6">
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
              onClick={() => setExportOpen(true)}
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
          <Card className="border-red-500/40 shadow-[0_0_16px_rgba(248,113,113,0.25)]">
            <CardContent className="p-0">
              <button
                onClick={logout}
                className="w-full flex items-center gap-4 p-5 hover:bg-red-500/10 transition-colors rounded-2xl text-red-400"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(248,113,113,0.4)]">
                  <LogOut className="w-5 h-5 text-red-400" />
                </div>
                <span className="flex-1 text-left font-medium text-red-400">Sair</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar relatório (PDF)</DialogTitle>
            <DialogDescription>Escolha o período, o tipo e o nome do arquivo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="flex gap-2">
                <Select value={String(exportPeriod.month)} onValueChange={(v) => setExportPeriod(p => ({ ...p, month: Number(v) }))}>
                  <SelectTrigger className="flex-1"><SelectValue>{(v: string) => new Date(2020, Number(v)).toLocaleString('pt-BR', { month: 'long' })}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i} value={String(i)}>{new Date(2020, i).toLocaleString('pt-BR', { month: 'long' })}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(exportPeriod.year)} onValueChange={(v) => setExportPeriod(p => ({ ...p, year: Number(v) }))}>
                  <SelectTrigger className="w-24"><SelectValue>{(v: string) => v}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const y = new Date().getFullYear() - 2 + i
                      return <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={exportAllMonths} onChange={(e) => setExportAllMonths(e.target.checked)} />
                Todos os meses
              </label>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={exportType} onValueChange={(v) => setExportType(v as any)}>
                <SelectTrigger><SelectValue>{(v: string) => v === 'all' ? 'Ambos' : v === 'income' ? 'Receitas' : 'Despesas'}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Ambos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nome do arquivo</Label>
              <Input value={exportFilename} onChange={(e) => setExportFilename(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExportOpen(false)}>Cancelar</Button>
            <Button onClick={exportar}>Gerar PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}