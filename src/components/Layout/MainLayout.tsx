import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const titleMap: Record<string, string> = {
  '/dashboard': '工作台',
  '/tasks': '接运任务',
  '/tasks/new': '新建任务',
  '/vehicles': '车辆调度',
  '/staff': '人员排班',
  '/navigation': '路线导航',
  '/transfer': '交接登记',
  '/cold-storage': '冷藏管理',
  '/statistics': '统计分析',
};

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    for (const path of Object.keys(titleMap).sort((a, b) => b.length - a.length)) {
      if (location.pathname.startsWith(path)) {
        return titleMap[path];
      }
    }
    return '殡仪馆接运调度系统';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        <Header title={getTitle()} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
