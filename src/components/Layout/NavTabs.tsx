import { NavLink } from 'react-router-dom';
import { BarChart, Users, PiggyBank, TrendingUp, Notebook, LucideIcon } from 'lucide-react';

interface Tab {
  path: string;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { path: '/dashboard', label: 'Tableau de bord', icon: BarChart },
  { path: '/management', label: 'Gestion', icon: Users },
  { path: '/cagnottes', label: 'Cagnottes', icon: PiggyBank },
  { path: '/analysis', label: 'Analyse', icon: TrendingUp },
  { path: '/notepad', label: 'Notes', icon: Notebook },
];

export function NavTabs() {
  return (
    <div className="flex gap-4 flex-wrap">
      {TABS.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-orange-100'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </div>
  );
}
