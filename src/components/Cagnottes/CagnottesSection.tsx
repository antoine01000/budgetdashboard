import { useState } from 'react';
import { Info, Plus } from 'lucide-react';
import useAppStore from '../../store';
import { CagnotteItem } from './CagnotteItem';

export function CagnottesSection() {
  const { cagnottes, addCagnotte } = useAppStore();
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'Cagnotte' | 'Dette'>('Cagnotte');

  const cagnottesItems = cagnottes.filter(item => item.type === 'Cagnotte');
  const dettesItems = cagnottes.filter(item => item.type === 'Dette');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addCagnotte(newItemName.trim(), newItemType);
    setNewItemName('');
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des Cagnottes et Dettes</h2>

      <form onSubmit={handleAddItem} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
          placeholder="Nom de la cagnotte/dette"
          className="flex-1 px-4 py-2 border rounded"
        />
        <select
          value={newItemType}
          onChange={e => setNewItemType(e.target.value as 'Cagnotte' | 'Dette')}
          className="px-4 py-2 border rounded bg-gray-50"
        >
          <option value="Cagnotte">Cagnotte</option>
          <option value="Dette">Dette</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Créer
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-4">Cagnottes</h3>
          <div className="space-y-4">
            {cagnottesItems.map(item => (
              <CagnotteItem key={item.id} item={item} />
            ))}
            {cagnottesItems.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
                <Info size={24} className="mx-auto mb-2" />
                <p>Aucune cagnotte créée</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-4">Dettes</h3>
          <div className="space-y-4">
            {dettesItems.map(item => (
              <CagnotteItem key={item.id} item={item} />
            ))}
            {dettesItems.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
                <Info size={24} className="mx-auto mb-2" />
                <p>Aucune dette créée</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
