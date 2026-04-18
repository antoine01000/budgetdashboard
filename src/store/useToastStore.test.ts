import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useToastStore, toast } from './useToastStore';

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('ajoute un toast via push', () => {
    useToastStore.getState().push('Hello', 'info');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe('Hello');
    expect(useToastStore.getState().toasts[0].type).toBe('info');
  });

  it('utilise le type info par défaut', () => {
    useToastStore.getState().push('X');
    expect(useToastStore.getState().toasts[0].type).toBe('info');
  });

  it('supprime un toast via dismiss', () => {
    useToastStore.getState().push('A');
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().dismiss(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('helpers toast.error / success / info dispatchent le bon type', () => {
    toast.error('err');
    toast.success('ok');
    toast.info('nfo');
    const types = useToastStore.getState().toasts.map(t => t.type);
    expect(types).toEqual(['error', 'success', 'info']);
  });

  it('auto-dismiss après 5 secondes', () => {
    vi.useFakeTimers();
    useToastStore.getState().push('timeout');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(5000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
    vi.useRealTimers();
  });
});
