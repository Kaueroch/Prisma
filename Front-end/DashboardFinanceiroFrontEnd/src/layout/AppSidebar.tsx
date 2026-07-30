import { Home, ArrowLeftRight, PiggyBank, Tags, Target, Users, Settings, Plus } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import type { Tab } from '../shared/types'

interface AppSidebarProps {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  onOpenTransactionForm: () => void
}

const mainItems = [
  { tab: 'home' as Tab, label: 'Painel', icon: Home },
  { tab: 'transactions' as Tab, label: 'Transações', icon: ArrowLeftRight },
  { tab: 'budgets' as Tab, label: 'Orçamentos', icon: PiggyBank },
  { tab: 'categories' as Tab, label: 'Categorias', icon: Tags },
]

const crmItems = [
  { tab: 'contacts' as Tab, label: 'Contatos', icon: Users },
  { tab: 'goals' as Tab, label: 'Metas', icon: Target },
]

export function AppSidebar({ activeTab, setActiveTab, onOpenTransactionForm }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border pb-4">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
            P
          </div>
          <span className="text-base font-bold tracking-tight truncate group-data-[collapsible=icon]:hidden">
            Prisma CRM
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton
                    isActive={activeTab === item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>CRM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {crmItems.map((item) => (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton
                    isActive={activeTab === item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  tooltip="Configurações"
                >
                  <Settings />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onOpenTransactionForm}
              tooltip="Nova Transação"
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-medium"
            >
              <Plus />
              <span>Nova Transação</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
