import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Copy,
  Edit2,
  GripVertical,
  Maximize2,
  Minimize2,
  Trash2,
  User,
  X,
} from 'lucide-react';
import useAppStore from '../../store';
import { Category, Expense } from '../../types';

interface Props {
  onClose: () => void;
  onEditExpense: (expense: Expense) => void;
  onCopyMonth: (sourceMonth: string) => void;
}

const getVariation = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export function MonthlyTable({ onClose, onEditExpense, onCopyMonth }: Props) {
  const { expenses, persons, categories, deleteExpense, updateCategoriesOrder } = useAppStore();
  const months = [...new Set(expenses.map(e => e.month))].sort();

  const tableRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>(categories);
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    setOrderedCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (tableRef.current) {
      setTimeout(() => {
        tableRef.current?.scrollTo({ left: tableRef.current.scrollWidth, behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Erreur fullscreen:', err);
    }
  };

  const handleClose = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } finally {
      onClose();
    }
  };

  const handleDragStart = (category: Category) => setDraggedCategory(category);

  const handleDragOver = (e: React.DragEvent, target: Category) => {
    e.preventDefault();
    if (!draggedCategory || draggedCategory.id === target.id) return;
    const current = [...orderedCategories];
    const fromIdx = current.findIndex(c => c.id === draggedCategory.id);
    const toIdx = current.findIndex(c => c.id === target.id);
    if (fromIdx === -1 || toIdx === -1) return;
    current.splice(fromIdx, 1);
    current.splice(toIdx, 0, draggedCategory);
    setOrderedCategories(current);
  };

  const handleDragEnd = () => {
    if (draggedCategory) updateCategoriesOrder(orderedCategories);
    setDraggedCategory(null);
  };

  const monthTotal = (month: string) =>
    expenses.filter(e => e.month === month).reduce((sum, e) => sum + e.amount, 0);

  const personMonthTotal = (month: string, personId: string) =>
    expenses
      .filter(e => e.month === month && e.person_id === personId)
      .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white ${
          isFullscreen ? 'w-full h-full rounded-none' : 'max-w-[95vw] w-full max-h-[90vh] rounded-lg'
        } overflow-hidden flex flex-col`}
      >
        <div className="flex justify-between items-center p-6 sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Récapitulatif mensuel</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User size={16} />
              <span>{persons.length} personnes</span>
              <span className="mx-2">•</span>
              <Calendar size={16} />
              <span>{months.length} mois</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="overflow-x-auto" ref={tableRef}>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky top-0 left-0 z-20 bg-white p-4 text-left border-b">
                      <div className="font-semibold text-gray-900">Catégories</div>
                    </th>
                    {months.map(month => {
                      const total = monthTotal(month);
                      const prev = months[months.indexOf(month) - 1];
                      const prevTotal = prev ? monthTotal(prev) : 0;
                      const variation = getVariation(total, prevTotal);
                      return (
                        <th
                          key={month}
                          className={`sticky top-0 z-10 bg-white min-w-[300px] p-4 border-b ${
                            hoveredMonth === month ? 'bg-orange-50' : ''
                          }`}
                          onMouseEnter={() => setHoveredMonth(month)}
                          onMouseLeave={() => setHoveredMonth(null)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-900">{month}</div>
                            <button
                              onClick={() => onCopyMonth(month)}
                              className="p-1.5 text-orange-500 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                              title="Copier ce mois"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="font-medium text-gray-900">{total.toFixed(2)} €</div>
                            {variation !== 0 && (
                              <div
                                className={`flex items-center gap-1 ${
                                  variation > 0 ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                {variation > 0 ? (
                                  <ArrowUpRight size={14} />
                                ) : (
                                  <ArrowDownRight size={14} />
                                )}
                                {Math.abs(variation).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
                            {persons.map(person => {
                              const pt = personMonthTotal(month, person.id);
                              return (
                                <div key={person.id} className="text-sm">
                                  <div className="font-medium text-gray-700">{person.name}</div>
                                  {pt > 0 && (
                                    <div className="text-gray-500 mt-1">{pt.toFixed(2)} €</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {orderedCategories.map(category => (
                    <tr
                      key={category.id}
                      className={`group border-b hover:bg-gray-50 transition-colors ${
                        draggedCategory?.id === category.id ? 'opacity-50' : ''
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(category)}
                      onDragOver={e => handleDragOver(e, category)}
                      onDragEnd={handleDragEnd}
                    >
                      <td className="sticky left-0 bg-white group-hover:bg-gray-50 z-10 p-4 transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className="cursor-move text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Déplacer la catégorie"
                          >
                            <GripVertical size={16} />
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-gray-900 truncate">
                              {category.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      {months.map(month => {
                        const monthExpenses = expenses.filter(
                          e => e.month === month && e.category_id === category.id,
                        );
                        return (
                          <td
                            key={month}
                            className={`p-4 ${hoveredMonth === month ? 'bg-orange-50' : ''}`}
                          >
                            <div className="grid grid-cols-2 gap-4">
                              {persons.map(person => {
                                const personExpenses = monthExpenses.filter(
                                  e => e.person_id === person.id,
                                );
                                return (
                                  <div key={person.id} className="space-y-2">
                                    {personExpenses.map(expense => (
                                      <div
                                        key={expense.id}
                                        className="flex items-center justify-between p-2.5 bg-white border rounded-lg hover:border-orange-200 hover:shadow-sm transition-all group/expense"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="font-medium text-gray-900">
                                            {expense.amount.toFixed(2)} €
                                          </div>
                                          {expense.comment && (
                                            <div
                                              className="text-sm text-gray-500 truncate"
                                              title={expense.comment}
                                            >
                                              {expense.comment}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover/expense:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => onEditExpense(expense)}
                                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                            title="Modifier"
                                          >
                                            <Edit2 size={14} />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (confirm('Supprimer cette dépense ?')) {
                                                deleteExpense(expense.id);
                                              }
                                            }}
                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                            title="Supprimer"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
