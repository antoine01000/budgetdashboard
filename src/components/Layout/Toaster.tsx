import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore, ToastType } from '../../store/useToastStore';

const iconFor = (type: ToastType) => {
  switch (type) {
    case 'error':
      return <AlertCircle size={18} />;
    case 'success':
      return <CheckCircle2 size={18} />;
    default:
      return <Info size={18} />;
  }
};

const classesFor = (type: ToastType) => {
  switch (type) {
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800';
  }
};

export function Toaster() {
  const toasts = useToastStore(state => state.toasts);
  const dismiss = useToastStore(state => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          className={`flex items-start gap-3 p-3 border rounded-lg shadow-lg ${classesFor(t.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">{iconFor(t.type)}</div>
          <div className="flex-1 text-sm">{t.message}</div>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Fermer"
            className="flex-shrink-0 opacity-60 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
