import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Notepad, CreateNotepadInput } from '../types/notepad';

interface NotepadStore {
  notepads: Notepad[];
  loading: boolean;
  error: string | null;
  fetchNotepads: () => Promise<void>;
  createNotepad: (input: CreateNotepadInput) => Promise<void>;
  updateNotepad: (id: string, input: Partial<CreateNotepadInput>) => Promise<void>;
  deleteNotepad: (id: string) => Promise<void>;
}

export const useNotepadStore = create<NotepadStore>((set, get) => ({
  notepads: [],
  loading: false,
  error: null,

  fetchNotepads: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notepad')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ notepads: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createNotepad: async (input: CreateNotepadInput) => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notepad')
        .insert([{
          ...input,
          user_id: session.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ notepads: [data, ...state.notepads] }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateNotepad: async (id: string, input: Partial<CreateNotepadInput>) => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notepad')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        notepads: state.notepads.map(note => 
          note.id === id ? data : note
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteNotepad: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notepad')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        notepads: state.notepads.filter(note => note.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
