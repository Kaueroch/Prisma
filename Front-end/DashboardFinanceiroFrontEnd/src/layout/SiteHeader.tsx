import {
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '../auth/AuthContext'
import { useFinance } from '../finance/useFinance'
import type { Tab } from '../shared/types'

interface SiteHeaderProps {
  activeTab: Tab
}

const tabLabels: Record<Tab, string> = {
  home: 'Dashboard',
  transactions: 'Transações',
  budgets: 'Orçamentos',
  categories: 'Categorias',
  goals: 'Metas',
  contacts: 'Contatos',
  profile: 'Configurações',
}

export function SiteHeader({ activeTab }: SiteHeaderProps) {
  const { user, logout } = useAuth()
  const { balance } = useFinance()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <SidebarSeparator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium">
                {tabLabels[activeTab]}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <span className="text-sm text-muted-foreground hidden sm:block">
          Saldo:{' '}
          <span className={`font-semibold ${balance >= 0 ? 'text-lime-400/90' : 'text-red-400'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
          </span>
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 outline-none">
              <Avatar className="h-8 w-8 border border-border cursor-pointer">
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">
                {user?.name || 'Usuário'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user?.email || ''}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
