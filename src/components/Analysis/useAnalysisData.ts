import { useMemo } from 'react';
import useAppStore from '../../store';
import { FiltersState } from './AnalysisFilters';

export function useAnalysisData(filters: FiltersState) {
  const { expenses, persons, categories } = useAppStore();

  return useMemo(() => {
    const { dateRange, customStartDate, customEndDate, selectedCategories } = filters;

    let startDate: Date;
    let endDate = new Date();
    const now = new Date();

    switch (dateRange) {
      case '3months':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6months':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '12months':
        startDate = new Date(now.setMonth(now.getMonth() - 12));
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0);
        break;
      case 'custom':
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.month);
      const matchesDate =
        dateRange === 'all' || (expenseDate >= startDate && expenseDate <= endDate);
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(expense.category_id);
      return matchesDate && matchesCategory;
    });

    const totalDepense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const depenseMoyenne = filteredExpenses.length > 0 ? totalDepense / filteredExpenses.length : 0;

    const monthlyTotals = new Map<string, number>();
    const monthlyVariations = new Map<string, number>();
    const sortedMonths = [...new Set(filteredExpenses.map(e => e.month))].sort();

    sortedMonths.forEach(month => {
      const total = filteredExpenses
        .filter(e => e.month === month)
        .reduce((sum, e) => sum + e.amount, 0);
      monthlyTotals.set(month, total);
      const previousMonth = sortedMonths[sortedMonths.indexOf(month) - 1];
      if (previousMonth) {
        const previousTotal = monthlyTotals.get(previousMonth) || 0;
        const variation =
          previousTotal === 0 ? 0 : ((total - previousTotal) / previousTotal) * 100;
        monthlyVariations.set(month, variation);
      } else {
        monthlyVariations.set(month, 0);
      }
    });

    const categoryTotalsRaw = new Map<string, number>();
    categories
      .filter(c => selectedCategories.length === 0 || selectedCategories.includes(c.id))
      .forEach(category => {
        const total = filteredExpenses
          .filter(e => e.category_id === category.id)
          .reduce((sum, e) => sum + e.amount, 0);
        categoryTotalsRaw.set(category.name, total);
      });
    const categoryTotals = new Map(
      [...categoryTotalsRaw.entries()].sort((a, b) => b[1] - a[1]),
    );

    const personCategoryTotals = new Map<string, Map<string, number>>();
    persons.forEach(person => {
      const perCategory = new Map<string, number>();
      const personExpenses = filteredExpenses.filter(e => e.person_id === person.id);
      categories
        .filter(c => selectedCategories.length === 0 || selectedCategories.includes(c.id))
        .forEach(category => {
          const amount = personExpenses
            .filter(e => e.category_id === category.id)
            .reduce((sum, e) => sum + e.amount, 0);
          if (amount > 0) perCategory.set(category.name, amount);
        });
      if (perCategory.size > 0) personCategoryTotals.set(person.name, perCategory);
    });

    return {
      filteredExpenses,
      totalDepense,
      depenseMoyenne,
      monthlyTotals,
      monthlyVariations,
      categoryTotals,
      personCategoryTotals,
    };
  }, [filters, expenses, persons, categories]);
}
