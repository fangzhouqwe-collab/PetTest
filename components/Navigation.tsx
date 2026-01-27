
import React from 'react';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.HOME, label: '首页', icon: 'home' },
    { id: AppTab.MARKET, label: '市集', icon: 'shopping_bag' },
    { id: AppTab.PUBLISH, label: '发布', icon: 'add_circle' },
    { id: AppTab.MESSAGES, label: '消息', icon: 'chat' },
    { id: AppTab.PROFILE, label: '我的', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 ios-blur bg-white/80 border-t border-ios-separator/30 flex items-start justify-around px-4 pt-3 z-50 max-w-[540px] mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-1 w-16 transition-colors ${
            activeTab === tab.id ? 'text-ios-blue' : 'text-ios-gray'
          }`}
        >
          <span className={`material-symbols-outlined !text-[28px] ${activeTab === tab.id ? 'material-symbols-fill' : ''}`}>
            {tab.icon}
          </span>
          <span className={`text-[11px] font-medium`}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
