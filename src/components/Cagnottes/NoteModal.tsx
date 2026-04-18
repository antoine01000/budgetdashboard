import { useState } from 'react';
import { Cagnotte } from '../../types';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface Props {
  onClose: () => void;
  cagnotte: Cagnotte;
  onSave: (content: string) => void;
  onDelete: () => void;
}

export function NoteModal({ onClose, cagnotte, onSave, onDelete }: Props) {
  const [content, setContent] = useState(cagnotte.note?.content || '');
  useEscapeKey(onClose);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Note pour {cagnotte.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full h-48 p-4 border rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Écrivez votre note ici..."
        />

        <div className="flex justify-between">
          {cagnotte.note && (
            <button
              onClick={() => {
                if (confirm('Supprimer cette note ?')) {
                  onDelete();
                  onClose();
                }
              }}
              className="px-4 py-2 text-red-600 hover:text-red-800"
            >
              Supprimer
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                onSave(content);
                onClose();
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
