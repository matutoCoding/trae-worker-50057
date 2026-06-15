import { Bell, Search, Settings, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDateTime } from '@/utils';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{formatDateTime(currentTime)}</span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="搜索..."
            className="w-48 h-9 pl-9 pr-4 bg-slate-50 border border-transparent rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </header>
  );
}
