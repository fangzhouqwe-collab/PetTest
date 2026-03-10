import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, LogOut, Megaphone } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { UsersManagement } from './pages/UsersManagement';
import { WorkersManagement } from './pages/WorkersManagement';
import { AnnouncementsManagement } from './pages/AnnouncementsManagement';

// =======================
// 1. Sidebar (左侧边栏)
// =======================
const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: '数据大盘', icon: LayoutDashboard },
    { path: '/users', label: '用户管理', icon: Users },
    { path: '/workers', label: '兼职者审核', icon: ShieldAlert },
    { path: '/announcements', label: '公告管理', icon: Megaphone },
  ];

  return (
    <div className="w-64 bg-ios-card/80 ios-blur border-r border-ios-separator h-screen flex flex-col p-4 fixed left-0 top-0">
      <div className="mb-8 px-2 mt-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-ios-blue to-purple-500">
          PetConnect Admin
        </h1>
        <p className="text-xs text-ios-gray mt-1 font-medium">桌面控制台</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-ios-blue text-white shadow-md shadow-ios-blue/20' 
                  : 'text-ios-text hover:bg-ios-bg active:bg-ios-gray-light'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-ios-gray'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-ios-separator mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-ios-red hover:bg-red-50 rounded-xl transition-all font-bold">
          <LogOut size={20} />
          退出管理系统
        </button>
      </div>
    </div>
  );
};


// =======================
// 主路由入口
// =======================
function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-ios-bg min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          {/* Header */}
          <header className="h-16 bg-ios-card/80 ios-blur border-b border-ios-separator sticky top-0 z-50 px-8 flex items-center justify-between">
            <div className="text-sm font-bold text-ios-gray">PetConnect 后台管理系统 v1.0</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-ios-blue text-white flex items-center justify-center font-bold">A</div>
              <span className="font-medium text-sm">Admin</span>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/workers" element={<WorkersManagement />} />
            <Route path="/announcements" element={<AnnouncementsManagement />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
