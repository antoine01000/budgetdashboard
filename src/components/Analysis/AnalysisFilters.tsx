import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Filter, Search, Tags, X } from 'lucide-react';
import useAppStore from '../../store';

export type DateRange = 'all' | '3months' | '6months' | '12months' | 'year' | 'custom';

export interface FiltersState {
  dateRange: DateRange;
  customStartDate: string;
  customEndDate: string;
  selectedCategories: string[];
}

interface Props {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
}

export function AnalysisFilters({ value, onChange }: Props) {
  const { categories } = useAppStore();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = useMemo(
    () =>
      categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())),
    [categories, categorySearch],
  );

  const toggleCategory = (id: string) => {
    onChange({
      ...value,
      selectedCategories: value.selectedCategories.includes(id)
        ? value.selectedCategories.filter(x => x !== id)
        : [...value.selectedCategories, id],
    });
  };

  const toggleAllCategories = () => {
    onChange({
      ...value,
      selectedCategories:
        value.selectedCategories.length === categories.length ? [] : categories.map(c => c.id),
    });
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={value.dateRange}
            onChange={e => onChange({ ...value, dateRange: e.target.value as DateRange })}
            className="p-2 border rounded-lg"
          >
            <option value="all">Toutes les périodes</option>
            <option value="3months">3 derniers mois</option>
            <option value="6months">6 derniers mois</option>
            <option value="12months">12 derniers mois</option>
            <option value="year">Année en cours</option>
            <option value="custom">Période personnalisée</option>
          </select>
        </div>

        {value.dateRange === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={value.customStartDate}
              onChange={e => onChange({ ...value, customStartDate: e.target.value })}
              className="p-2 border rounded-lg"
            />
            <span>à</span>
            <input
              type="month"
              value={value.customEndDate}
              onChange={e => onChange({ ...value, customEndDate: e.target.value })}
              className="p-2 border rounded-lg"
            />
          </div>
        )}

        <div className="relative category-dropdown">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Tags size={20} className="text-gray-500" />
            <span>
              {value.selectedCategories.length === 0
                ? 'Toutes les catégories'
                : `${value.selectedCategories.length} catégorie${value.selectedCategories.length > 1 ? 's' : ''}`}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showCategoryDropdown && (
            <div className="absolute z-10 mt-2 w-72 bg-white border rounded-lg shadow-lg">
              <div className="p-2 border-b">
                <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value.selectedCategories.length === categories.length}
                    onChange={toggleAllCategories}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="font-medium">Tout sélectionner</span>
                </label>
              </div>
              <div className="p-2 border-b">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    placeholder="Rechercher une catégorie..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {filteredCategories.map(category => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={value.selectedCategories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="text-center py-4 text-gray-500">Aucune catégorie trouvée</div>
                )}
              </div>
            </div>
          )}
        </div>

        {value.selectedCategories.length > 0 && (
          <button
            onClick={() => onChange({ ...value, selectedCategories: [] })}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <X size={14} />
            Réinitialiser
          </button>
        )}
      </div>
    </section>
  );
}
