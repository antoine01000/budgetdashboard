import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAppStore from './store';
import { AuthPage } from './components/Auth/AuthPage';
import { TopNav } from './components/Layout/TopNav';
import { NavTabs } from './components/Layout/NavTabs';
import ExpenseCharts from './components/Charts/ExpenseCharts';
import { AddExpenseModal } from './components/Expenses/AddExpenseModal';
import { ManagementSection } from './components/Management/ManagementSection';
import { CagnottesSection } from './components/Cagnottes/CagnottesSection';
import { ExpenseAnalysis } from './components/Analysis/ExpenseAnalysis';
import { Notepad } from './components/Notepad';
import { Plus } from 'lucide-react';

function App() {
  const currentUser = useAppStore(state => state.currentUser);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="p-4 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <NavTabs />
          {isDashboard && (
            <button
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus size={20} />
              Ajouter une dépense
            </button>
          )}
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ExpenseCharts />} />
          <Route path="/management" element={<ManagementSection />} />
          <Route path="/cagnottes" element={<CagnottesSection />} />
          <Route path="/analysis" element={<ExpenseAnalysis />} />
          <Route path="/notepad" element={<Notepad />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
      />

    </div>
  );
}

export default App;
