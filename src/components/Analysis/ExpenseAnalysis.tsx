import { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { ArrowDownRight, ArrowUpRight, Tags, TrendingUp, Users } from 'lucide-react';
import '../../lib/chartjs';
import useAppStore from '../../store';
import { AnalysisFilters, FiltersState } from './AnalysisFilters';
import { useAnalysisData } from './useAnalysisData';

export function ExpenseAnalysis() {
  const { categories } = useAppStore();
  const [filters, setFilters] = useState<FiltersState>({
    dateRange: 'all',
    customStartDate: new Date().toISOString().slice(0, 7),
    customEndDate: new Date().toISOString().slice(0, 7),
    selectedCategories: [],
  });

  const {
    filteredExpenses,
    depenseMoyenne,
    monthlyTotals,
    monthlyVariations,
    categoryTotals,
    personCategoryTotals,
  } = useAnalysisData(filters);

  return (
    <div className="space-y-6">
      <AnalysisFilters value={filters} onChange={setFilters} />

      <section className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-orange-500" size={24} />
          <h2 className="text-2xl font-bold">Dépense Moyenne par Transaction</h2>
        </div>
        <div className="text-3xl font-semibold text-orange-500">
          {depenseMoyenne.toFixed(2)} €
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Moyenne calculée sur {filteredExpenses.length} transaction
          {filteredExpenses.length > 1 ? 's' : ''}.
        </p>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-orange-500" size={24} />
          <h2 className="text-2xl font-bold">Évolution des dépenses</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {Array.from(monthlyVariations.entries())
            .slice(-2)
            .map(([month, variation]) => (
              <div key={month} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">{month}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {(monthlyTotals.get(month) || 0).toFixed(2)} €
                  </span>
                  {variation !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        variation > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {variation > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {Math.abs(variation).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        <div className="h-[300px]">
          <Line
            data={{
              labels: Array.from(monthlyTotals.keys()),
              datasets: [
                {
                  label: 'Total des dépenses',
                  data: Array.from(monthlyTotals.values()),
                  borderColor: 'rgb(249, 115, 22)',
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: context => `${(context.raw as number).toFixed(2)} €`,
                  },
                },
              },
              scales: {
                y: { beginAtZero: true, ticks: { callback: value => `${value} €` } },
              },
            }}
          />
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Tags className="text-orange-500" size={24} />
          <h2 className="text-2xl font-bold">
            {filters.selectedCategories.length > 0
              ? 'Catégories sélectionnées'
              : 'Répartition par catégorie'}
          </h2>
        </div>
        <Bar
          data={{
            labels: Array.from(categoryTotals.keys()),
            datasets: [
              {
                label: 'Montant total',
                data: Array.from(categoryTotals.values()),
                backgroundColor: Array.from(categoryTotals.keys()).map(
                  name => categories.find(c => c.name === name)?.color || '#cccccc',
                ),
                borderWidth: 0,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: { label: context => `${(context.raw as number).toFixed(2)} €` },
              },
            },
            scales: {
              y: { beginAtZero: true, ticks: { callback: value => `${value} €` } },
            },
          }}
        />
      </section>

      <section className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-orange-500" size={24} />
          <h2 className="text-2xl font-bold">Répartition par personne</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {Array.from(personCategoryTotals.entries()).map(([person, totals]) => {
            const total = Array.from(totals.values()).reduce((a, b) => a + b, 0);
            return (
              <div key={person} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium mb-1">{person}</div>
                <div className="text-lg font-bold">{total.toFixed(2)} €</div>
              </div>
            );
          })}
        </div>

        <Bar
          data={{
            labels: Array.from(personCategoryTotals.keys()),
            datasets: categories
              .filter(
                c =>
                  filters.selectedCategories.length === 0 ||
                  filters.selectedCategories.includes(c.id),
              )
              .map(category => ({
                label: category.name,
                data: Array.from(personCategoryTotals.keys()).map(
                  person => personCategoryTotals.get(person)?.get(category.name) || 0,
                ),
                backgroundColor: category.color,
                stack: 'stack',
              })),
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                align: 'start',
                labels: { boxWidth: 12, padding: 15, font: { size: 11 } },
              },
              tooltip: {
                callbacks: {
                  label: context =>
                    `${context.dataset.label}: ${(context.raw as number).toFixed(2)} €`,
                },
              },
            },
            scales: {
              x: { stacked: true },
              y: {
                stacked: true,
                beginAtZero: true,
                ticks: { callback: value => `${value} €` },
              },
            },
          }}
        />
      </section>
    </div>
  );
}
