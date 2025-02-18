import React, { useEffect, useState } from 'react';
import { useNotepadStore } from '../store/useNotepadStore';
import { CreateNotepadInput } from '../types/notepad';

export const Notepad: React.FC = () => {
  const { notepads, loading, error, fetchNotepads, createNotepad, updateNotepad, deleteNotepad } = useNotepadStore();
  const [newNote, setNewNote] = useState<CreateNotepadInput>({ title: '', content: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotepads();
  }, [fetchNotepads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateNotepad(editingId, newNote);
      setEditingId(null);
    } else {
      await createNotepad(newNote);
    }
    setNewNote({ title: '', content: '' });
  };

  const handleEdit = (id: string, title: string, content: string) => {
    setEditingId(id);
    setNewNote({ title, content });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Content"
            value={newNote.content}
            onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId ? 'Update Note' : 'Add Note'}
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notepads.map(note => (
          <div key={note.id} className="border rounded p-4">
            <h3 className="font-bold mb-2">{note.title}</h3>
            <p className="mb-4 whitespace-pre-wrap">{note.content}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(note.id, note.title, note.content)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteNotepad(note.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
