import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnalysisData } from './useAnalysisData';
import type { FiltersState } from './AnalysisFilters';

const mockExpenses = [
  {
    id: 'e1',
    month: '2024-01',
    amount: 100,
    person_id: 'p1',
    category_id: 'c1',
    user_id: 'u1',
    created_at: '2024-01-01',
  },
  {
    id: 'e2',
    month: '2024-01',
    amount: 50,
    person_id: 'p2',
    category_id: 'c1',
    user_id: 'u1',
    created_at: '2024-01-01',
  },
  {
    id: 'e3',
    month: '2024-02',
    amount: 200,
    person_id: 'p1',
    category_id: 'c2',
    user_id: 'u1',
    created_at: '2024-02-01',
  },
];

const mockPersons = [
  { id: 'p1', name: 'Alice', user_id: 'u1', created_at: '' },
  { id: 'p2', name: 'Bob', user_id: 'u1', created_at: '' },
];

const mockCategories = [
  { id: 'c1', name: 'Courses', color: '#ff0000', user_id: 'u1', created_at: '', order: 0 },
  { id: 'c2', name: 'Loisirs', color: '#00ff00', user_id: 'u1', created_at: '', order: 1 },
];

vi.mock('../../store', () => ({
  default: () => ({
    expenses: mockExpenses,
    persons: mockPersons,
    categories: mockCategories,
  }),
}));

const defaultFilters: FiltersState = {
  dateRange: 'all',
  customStartDate: '2024-01',
  customEndDate: '2024-12',
  selectedCategories: [],
};

describe('useAnalysisData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calcule le total des dépenses', () => {
    const { result } = renderHook(() => useAnalysisData(defaultFilters));
    expect(result.current.totalDepense).toBe(350);
  });

  it('calcule la dépense moyenne par transaction', () => {
    const { result } = renderHook(() => useAnalysisData(defaultFilters));
    expect(result.current.depenseMoyenne).toBeCloseTo(350 / 3);
  });

  it('agrège les totaux mensuels', () => {
    const { result } = renderHook(() => useAnalysisData(defaultFilters));
    expect(result.current.monthlyTotals.get('2024-01')).toBe(150);
    expect(result.current.monthlyTotals.get('2024-02')).toBe(200);
  });

  it("calcule la variation d'un mois à l'autre", () => {
    const { result } = renderHook(() => useAnalysisData(defaultFilters));
    // 150 -> 200 = +33.33%
    expect(result.current.monthlyVariations.get('2024-02')).toBeCloseTo(33.33, 1);
  });

  it('filtre par catégorie sélectionnée', () => {
    const { result } = renderHook(() =>
      useAnalysisData({ ...defaultFilters, selectedCategories: ['c1'] }),
    );
    // Seulement e1 (100) et e2 (50) sont dans la catégorie c1
    expect(result.current.totalDepense).toBe(150);
    expect(result.current.filteredExpenses).toHaveLength(2);
  });

  it('agrège par personne et catégorie', () => {
    const { result } = renderHook(() => useAnalysisData(defaultFilters));
    expect(result.current.personCategoryTotals.get('Alice')?.get('Courses')).toBe(100);
    expect(result.current.personCategoryTotals.get('Alice')?.get('Loisirs')).toBe(200);
    expect(result.current.personCategoryTotals.get('Bob')?.get('Courses')).toBe(50);
  });

  it('trie les catégories par total décroissant', () => {
    const { result } = renderHook(() => useAnalysisData(defaultFilters));
    const entries = Array.from(result.current.categoryTotals.entries());
    expect(entries[0][0]).toBe('Loisirs'); // 200
    expect(entries[1][0]).toBe('Courses'); // 150
  });
});
