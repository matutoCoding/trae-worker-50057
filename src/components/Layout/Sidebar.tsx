import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  Users,
  MapPin,
  FileText,
  Refrigerator,
  BarChart3,
  Menu,
  X,
  Phone,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { path: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { path: '/tasks', label: '接运任务', icon: ClipboardList },
  { path: '/vehicles', label: '车辆调度', icon: Truck },
  { path: '/staff', label: '人员排班', icon: Users },
  { path: '/navigation', label: '路线导航', icon: MapPin },
  { path: '/transfer', label: '交接登记', icon: FileText },
  { path: '/cold-storage', label: '冷藏管理', icon: Refrigerator },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-800 text-white transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-slate-900" />
            </div>
            <span className="font-bold text-lg">接运调度</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mx-auto">
            <Phone className="w-5 h-5 text-slate-900" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
        >
          {collapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border-r-4 border-amber-500'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">调度员 - 黄丽华</p>
              <p className="text-xs text-slate-400">在岗</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      )}
    </aside>
  );
}
