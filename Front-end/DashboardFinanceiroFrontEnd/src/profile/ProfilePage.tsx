import React from 'react';
import { User, Palette, Download, Settings as SettingsIcon, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="p-10 max-w-3xl mx-auto w-full">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-white/40" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">{user?.name || 'Usuário'}</h2>
        <p className="text-white/40 text-sm">{user?.email || ''}</p>
      </div>

      {/* Settings list */}
      <h3 className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-4 pl-2">Preferências</h3>
      <div className="glass-card rounded-3xl overflow-hidden mb-8">
        <button className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-glass border-b border-white/[0.06] cursor-pointer">
          <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <span className="flex-1 text-left text-white font-medium">Aparência</span>
          <span className="text-white/40 text-sm pr-2">Escuro</span>
          <ChevronRight className="w-4 h-4 text-white/30" />
        </button>

        <button className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-glass cursor-pointer">
          <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <span className="flex-1 text-left text-white font-medium">Gerenciar Categorias</span>
          <ChevronRight className="w-4 h-4 text-white/30" />
        </button>
      </div>

      <h3 className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-4 pl-2">Conta & Dados</h3>
      <div className="glass-card rounded-3xl overflow-hidden">
        <button className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-glass border-b border-white/[0.06] cursor-pointer">
          <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
            <Download className="w-5 h-5 text-white/60" />
          </div>
          <span className="flex-1 text-left text-white font-medium">Exportar Dados</span>
        </button>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-glass cursor-pointer"
        >
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <span className="flex-1 text-left text-red-500 font-medium">Sair</span>
        </button>
      </div>

    </div>
  );
}
