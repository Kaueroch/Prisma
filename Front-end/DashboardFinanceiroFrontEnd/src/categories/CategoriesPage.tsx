import React, { useState } from 'react';
import { useFinance } from '../finance/useFinance';
import { CategoryInfo, Expense, CategoryId } from '../shared/types';
import { Utensils, Car, ShoppingBag, Receipt, Grid, DollarSign, Plus, ChevronDown, ChevronUp, Trash2, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatBRL, formatDateBR } from '../shared/utils/formatters';

const AVAILABLE_ICONS = [
  { id: 'Utensils', icon: Utensils },
  { id: 'Car', icon: Car },
  { id: 'ShoppingBag', icon: ShoppingBag },
  { id: 'Receipt', icon: Receipt },
  { id: 'Grid', icon: Grid },
  { id: 'DollarSign', icon: DollarSign },
];

export function CategoriesPage() {
  const { categories, expenses, addCategory, deleteCategory, updateCategory } = useFinance();
  const [expandedId, setExpandedId] = useState<CategoryId | null>(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8b5cf6');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Group expenses
  const grouped = expenses.reduce((acc, expense) => {
    if (!acc[expense.categoryId]) {
      acc[expense.categoryId] = { total: 0, items: [] };
    }
    acc[expense.categoryId].total += expense.amount;
    acc[expense.categoryId].items.push(expense);
    return acc;
  }, {} as Record<CategoryId, { total: number; items: Expense[] }>);

  const totalOverall = expenses.reduce((sum, item) => sum + item.amount, 0);

  const toggleExpand = (id: CategoryId) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAdd = () => {
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      bgClass: 'bg-white/10',
      textClass: 'text-white'
    });
    setNewCatName('');
    setIsAdding(false);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateCategory(id, { name: editName.trim() });
    setEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-10 gap-8 max-w-[1400px] mx-auto w-full relative z-10">
      <div className="flex justify-between items-center bg-[#1c1c1f]/80 p-6 rounded-3xl border border-white/[0.05]">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Despesas por Categoria</h1>
          <p className="text-white/40 text-sm mt-1">Gerencie suas categorias e veja seus gastos</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-white text-black px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1c1c1f]/80 border border-white/[0.05] p-5 rounded-2xl flex items-end gap-4"
          >
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs text-white/40 font-medium">Nome da Categoria</label>
              <input 
                type="text" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none text-white focus:border-white/30"
                placeholder="Ex: Viagens"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/40 font-medium">Cor</label>
              <input 
                type="color" 
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="h-10 w-14 rounded-xl border border-white/10 bg-transparent cursor-pointer"
              />
            </div>
            <button onClick={handleAdd} className="h-10 px-6 bg-white text-black rounded-xl font-medium text-sm">
              Criar
            </button>
            <button onClick={() => setIsAdding(false)} className="h-10 px-4 bg-white/5 text-white/60 hover:text-white rounded-xl">
              Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const data = grouped[cat.id] || { total: 0, items: [] };
          const percent = totalOverall > 0 ? Math.round((data.total / totalOverall) * 100) : 0;
          const isExpanded = expandedId === cat.id;
          const isEditing = editingId === cat.id;

          // Default fallback icon
          const Icon = Grid;

          return (
            <div key={cat.id} className="bg-[#1c1c1f]/80 border border-white/[0.05] rounded-3xl flex flex-col overflow-hidden transition-all">
              <div className="p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center`} style={{ backgroundColor: cat.color }}>
                    <Icon className="w-5 h-5 text-black" strokeWidth={2.5} />
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="bg-black/20 border border-white/20 rounded-lg px-2 py-1 text-white text-lg w-32"
                        autoFocus
                      />
                      <button onClick={() => handleSaveEdit(cat.id)} className="p-1.5 bg-green-500/20 text-green-400 rounded-lg"><Check className="w-4 h-4"/></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 bg-white/5 text-white/40 rounded-lg"><X className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-lg flex items-center gap-2">
                        {cat.name}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setEditName(cat.name); setEditingId(cat.id); }} className="p-1 text-white/40 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="p-1 text-red-400/60 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </span>
                      <span className="text-white/40 text-xs">{data.items.length} transações</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(cat.id)}>
                  <div className="flex flex-col items-end">
                    <p className="text-lg font-semibold text-white">{formatBRL(data.total)}</p>
                    <span className="text-white/40 text-xs">{percent}% do total</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/[0.05]"
                  >
                    <div className="flex flex-col p-6 gap-4 max-h-64 overflow-y-auto custom-scrollbar">
                      {data.items.length === 0 ? (
                        <div className="text-center text-white/40 text-sm py-4">Nenhuma transação registrada.</div>
                      ) : (
                        data.items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <div className="flex flex-col">
                              <span className="text-sm text-white/80 font-medium">{item.name}</span>
                              <span className="text-xs text-white/30">{formatDateBR(item.date)}</span>
                            </div>
                            <span className="font-medium text-sm text-white">{formatBRL(item.amount)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
