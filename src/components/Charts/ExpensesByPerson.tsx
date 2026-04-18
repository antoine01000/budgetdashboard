import { Edit2, Trash2, User } from 'lucide-react';
import useAppStore from '../../store';
import { Expense } from '../../types';

interface Props {
  month: string;
  onEdit: (expense: Expense) => void;
}

export function ExpensesByPerson({ month, onEdit }: Props) {
  const { expenses, persons, categories, deleteExpense } = useAppStore();
  const filteredByMonth = expenses.filter(e => e.month === month);

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold mb-4">Dépenses par Personne pour {month}</h2>
      <div className="flex flex-wrap gap-4">
        {persons.map(person => {
          const personExpenses = filteredByMonth.filter(e => e.person_id === person.id);
          return (
            <div key={person.id} className="flex-1 min-w-[300px] bg-gray-50 p-4 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <User size={20} className="mr-2" />
                <h3 className="font-bold">{person.name}</h3>
              </div>
              {personExpenses.length === 0 ? (
                <p className="text-sm text-gray-600">Aucune dépense.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border-b p-1">Date</th>
                      <th className="border-b p-1">Montant</th>
                      <th className="border-b p-1">Catégorie</th>
                      <th className="border-b p-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personExpenses.map(expense => {
                      const category = categories.find(c => c.id === expense.category_id);
                      return (
                        <tr key={expense.id}>
                          <td className="border-b p-1">{expense.month}</td>
                          <td className="border-b p-1">{expense.amount.toFixed(2)} €</td>
                          <td className="border-b p-1">{category ? category.name : '-'}</td>
                          <td className="border-b p-1">
                            <button
                              onClick={() => onEdit(expense)}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                              title="Modifier"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Supprimer cette dépense ?')) deleteExpense(expense.id);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
