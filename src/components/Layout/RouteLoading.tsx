import { Loader2 } from 'lucide-react';

export function RouteLoading() {
  return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <Loader2 size={32} className="animate-spin" />
    </div>
  );
}
