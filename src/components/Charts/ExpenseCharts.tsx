import { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Table } from 'lucide-react';
import '../../lib/chartjs';
import useAppStore from '../../store';
import { Expense } from '../../types';
import { AddExpenseModal } from '../Expenses/AddExpenseModal';
import { MonthlyTable } from './MonthlyTable';
import { ExpensesByPerson } from './ExpensesByPerson';

export default function ExpenseCharts() {
  const { expenses, persons, categories, addExpense, updateExpense } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showMonthlyTable, setShowMonthlyTable] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const months = [...new Set(expenses.map(e => e.month))].sort();

  const handleCopyMonth = (sourceMonth: string) => {
    const targetMonth = prompt('Entrez le mois cible (YYYY-MM):');
    if (!targetMonth?.match(/^\d{4}-\d{2}$/)) {
      alert('Format de mois invalide. Utilisez YYYY-MM');
      return;
    }
    const monthExpenses = expenses.filter(e => e.month === sourceMonth);
    if (monthExpenses.length === 0) {
      alert('Aucune dépense à copier pour ce mois');
      return;
    }
    if (!confirm(`Copier ${monthExpenses.length} dépenses vers ${targetMonth} ?`)) return;
    monthExpenses.forEach(expense => {
      addExpense({
        month: targetMonth,
        amount: expense.amount,
        person_id: expense.person_id,
        category_id: expense.category_id,
        comment: expense.comment,
      });
    });
  };

  const barData = {
    labels: months,
    datasets: Object.values(
      expenses.reduce((acc: any, expense) => {
        const person = persons.find(p => p.id === expense.person_id);
        const category = categories.find(c => c.id === expense.category_id);
        if (!category) return acc;
        const key = `${expense.person_id}-${category.order}-${category.id}`;
        if (!acc[key]) {
          acc[key] = {
            label: `${person?.name || '?'} - ${category.name}`,
            data: {},
            backgroundColor: category.color || 'gray',
            stack: expense.person_id.toString(),
            order: category.order,
          };
        }
        acc[key].data[expense.month] = (acc[key].data[expense.month] || 0) + expense.amount;
        return acc;
      }, {}),
    )
      .sort((a: any, b: any) => a.order - b.order)
      .map((dataset: any) => ({
        ...dataset,
        data: months.map(month => dataset.data[month] || 0),
      })),
  };

  const numMonths = months.length;
  const categoryTotals = categories
    .map(category => {
      const total = expenses
        .filter(e => e.category_id === category.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return { category, total: numMonths > 0 ? total / numMonths : 0 };
    })
    .sort((a, b) => b.total - a.total);

  const doughnutData = {
    labels: categoryTotals.map(ct => ct.category.name),
    datasets: [
      {
        data: categoryTotals.map(ct => ct.total),
        backgroundColor: categoryTotals.map(ct => ct.category.color),
      },
    ],
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Graphique des dépenses</h2>
        <button
          onClick={() => setShowMonthlyTable(true)}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
        >
          <Table size={20} />
          Voir le récapitulatif
        </button>
      </div>

      <div className="mb-8">
        <div className="w-full max-w-md mx-auto mb-8">
          <Doughnut
            data={doughnutData}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>

        <Bar
          data={barData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: context => {
                    const value = context.raw as number;
                    return `${context.dataset.label}: ${value.toFixed(2)} €`;
                  },
                },
              },
            },
            scales: {
              x: { stacked: true },
              y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Montant' } },
            },
            onClick: (_, elements) => {
              if (elements.length > 0) {
                setSelectedMonth(months[elements[0].index]);
              }
            },
          }}
        />

        {selectedMonth && (
          <ExpensesByPerson month={selectedMonth} onEdit={setEditingExpense} />
        )}
      </div>

      {showMonthlyTable && (
        <MonthlyTable
          onClose={() => setShowMonthlyTable(false)}
          onEditExpense={setEditingExpense}
          onCopyMonth={handleCopyMonth}
        />
      )}

      {editingExpense && (
        <AddExpenseModal
          isOpen={true}
          onClose={() => setEditingExpense(null)}
          editExpense={editingExpense}
          onEdit={updated => {
            updateExpense(updated);
            setEditingExpense(null);
          }}
        />
      )}
    </section>
  );
}
