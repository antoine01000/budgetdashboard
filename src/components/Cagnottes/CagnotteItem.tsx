import { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Divide,
  Edit2,
  History,
  Minus,
  Plus,
  StickyNote,
  Trash2,
} from 'lucide-react';
import useAppStore from '../../store';
import { Cagnotte, SubCagnotte } from '../../types';
import { NoteModal } from './NoteModal';

interface Props {
  item: Cagnotte;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function CagnotteItem({ item }: Props) {
  const {
    updateCagnotte,
    deleteCagnotte,
    addSubCagnotte,
    updateSubCagnotteAmount,
    deleteSubCagnotte,
    addOrUpdateNote,
    deleteNote,
  } = useAppStore();

  const [expanded, setExpanded] = useState(false);
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const handleAmountSave = async () => {
    if (editingAmount === null) return;
    const amount = parseFloat(editingAmount);
    if (isNaN(amount)) {
      alert('Montant invalide');
      return;
    }
    try {
      await updateCagnotte(item.id, { amount });
      setEditingAmount(null);
    } catch {
      alert('Erreur lors de la mise à jour du montant');
    }
  };

  const handleAddSubItem = (name: string) => {
    if (!name.trim()) return;
    addSubCagnotte(item.id, name.trim());
  };

  const handleOperation = (sub: SubCagnotte, operation: string) => {
    const input = prompt(`Entrez la valeur pour l'opération ${operation} :`);
    if (!input) return;
    const value = parseFloat(input);
    if (isNaN(value)) {
      alert('Valeur invalide');
      return;
    }
    if (operation === '÷' && value === 0) {
      alert('Division par zéro impossible');
      return;
    }
    updateSubCagnotteAmount(sub.id, operation, value);
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.name}</span>
          <span
            className={`px-2 py-0.5 text-xs rounded ${
              item.type === 'Cagnotte'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {item.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {editingAmount !== null ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={editingAmount}
                onChange={e => setEditingAmount(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') handleAmountSave();
                }}
                className="w-24 px-2 py-1 border rounded text-right"
                autoFocus
              />
              <button
                onClick={handleAmountSave}
                className="p-1 text-green-600 hover:text-green-800"
              >
                ✓
              </button>
              <button
                onClick={() => setEditingAmount(null)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <span className="font-medium">{item.amount.toFixed(2)} €</span>
              <button
                onClick={() => setEditingAmount(item.amount.toString())}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="Modifier le montant"
              >
                <Edit2 size={16} />
              </button>
            </>
          )}
          <button
            onClick={() => setShowNoteModal(true)}
            className={`p-1 ${item.note ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
            title="Note"
          >
            <StickyNote size={16} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={() => {
              if (confirm('Supprimer cette ' + item.type.toLowerCase() + ' ?')) {
                deleteCagnotte(item.id);
              }
            }}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t p-3">
          <div className="space-y-2">
            {item.subcagnottes?.map(sub => (
              <div key={sub.id}>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">{sub.name}</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {sub.amount.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOperation(sub, '+')}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                      title="Ajouter"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => handleOperation(sub, '-')}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Soustraire"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => handleOperation(sub, '×')}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Multiplier"
                    >
                      <Calculator size={14} />
                    </button>
                    <button
                      onClick={() => handleOperation(sub, '÷')}
                      className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                      title="Diviser"
                    >
                      <Divide size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setShowHistoryFor(showHistoryFor === sub.id ? null : sub.id)
                      }
                      className={`p-1.5 hover:bg-gray-50 rounded ${
                        showHistoryFor === sub.id ? 'text-orange-600' : 'text-gray-600'
                      }`}
                      title="Historique"
                    >
                      <History size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Supprimer cette sous-cagnotte ?')) {
                          deleteSubCagnotte(sub.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {showHistoryFor === sub.id &&
                  (sub.operations?.length ? (
                    <div className="mt-2 space-y-1 text-sm">
                      {sub.operations.map(op => (
                        <div
                          key={op.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-gray-600"
                        >
                          <span>{formatDate(op.created_at)}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-orange-600">{op.operation}</span>
                            <span>
                              ({op.previous_amount.toFixed(2)} € → {op.new_amount.toFixed(2)} €)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-2">Aucune opération</div>
                  ))}
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder={`Nouvelle sous-${item.type.toLowerCase()}`}
              className="flex-1 px-3 py-1.5 text-sm border rounded"
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  handleAddSubItem(input.value);
                  input.value = '';
                }
              }}
            />
            <button
              onClick={e => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                handleAddSubItem(input.value);
                input.value = '';
              }}
              className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {showNoteModal && (
        <NoteModal
          onClose={() => setShowNoteModal(false)}
          cagnotte={item}
          onSave={content => addOrUpdateNote(item.id, content)}
          onDelete={() => item.note && deleteNote(item.note.id)}
        />
      )}
    </div>
  );
}
