import { BarChart, Users, PiggyBank, TrendingUp, Notebook, LucideIcon } from 'lucide-react';

export type TabId = 'dashboard' | 'management' | 'cagnottes' | 'analysis' | 'notepad';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart },
  { id: 'management', label: 'Gestion', icon: Users },
  { id: 'cagnottes', label: 'Cagnottes', icon: PiggyBank },
  { id: 'analysis', label: 'Analyse', icon: TrendingUp },
  { id: 'notepad', label: 'Notes', icon: Notebook },
];

interface Props {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function NavTabs({ activeTab, onChange }: Props) {
  return (
    <div className="flex gap-4 flex-wrap">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-orange-100'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
