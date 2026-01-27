
import React, { useState, useMemo } from 'react';
import { MarketItem } from '../types';

export const MARKET_ITEMS: MarketItem[] = [
  {
    id: '1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-JUUlCCFZwj2FhOi6ohwHJNRB1u4qfQk9APRwcD1RT7dQ2o2YOlPtYo49DyBV3lkHx6vmlddac-4fFowdv7HoTvdA5PYsx65Wi6hJlGE9kiyGfY39qo0rAFjK9AZcD2lcEQ2ODsepUnCNYXqUAcgcw3PWjGrON4yIlBdjt0d3ZyRgIT421OOCKDunQ_eMxrm1K7RCHbGTPjrYcY8PQYw1lzTcK_IFyu_mWqGa5YOji2POP2fvcXEvVJv5cPExJjSUlgKPhkLdbI4',
    name: '金毛寻回犬',
    category: '狗狗',
    price: 8500,
    verified: true,
    age: '3个月',
    gender: '公',
    location: '上海 浦东新区',
    distance: 1.2
  },
  {
    id: '2',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCisZzRdw6Mu6wtJNezaPgVjrFKV-AYmQhzbAYlRy91ZMjKYTnqqEDesSbIrKu16BTmwyodUAD9LW6vyZHd1Szr80fqN6J8GqrYOAn8T86jZ6GIeLJbfb1K2DIw24-aiWtblPck_XNiTR7P7Xwc0SyqSDf-MK4yVGrEO4vs2RrDoYN23BnjkKXJ4BvuZGsoMW6a6Pth6CtyU--mhQ50gwQdA_itYPsmAxv3vpftKYlfc0qb9SOf-bXAHpLWF8dOOOnhNxwaL3UCZVs',
    name: '英国短毛猫',
    category: '猫咪',
    price: 5800,
    verified: false,
    age: '2个月',
    gender: '母',
    location: '上海 静安区',
    distance: 4.5
  }
];

const CATEGORIES = [
  { label: '全部', icon: 'apps', color: 'text-gray-500' },
  { label: '狗狗', icon: 'pets', color: 'text-orange-400' },
  { label: '猫咪', icon: 'pets', color: 'text-yellow-500' },
  { label: '鸟类', icon: 'flutter_dash', color: 'text-blue-400' },
  { label: '爬宠', icon: 'egg', color: 'text-emerald-500' },
];

const MarketScreen: React.FC<{ items: MarketItem[], onItemClick: (item: MarketItem) => void }> = ({ items, onItemClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');
  const [distanceSort, setDistanceSort] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== '全部') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }

    if (selectedGender) {
      filtered = filtered.filter(item => item.gender === selectedGender);
    }

    if (distanceSort) {
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (priceSort === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [items, searchQuery, activeCategory, priceSort, distanceSort, selectedGender]);

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg">
      <header className="sticky top-0 z-50 bg-white/80 ios-blur border-b border-ios-separator/30 px-4 pt-12 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-bold tracking-tight">宠物市集</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[14px] font-medium transition-colors ${showFilters ? 'bg-ios-blue text-white' : 'bg-ios-bg text-ios-blue'}`}
          >
            <span className="material-symbols-outlined !text-[18px]">filter_list</span>
            筛选
          </button>
        </div>

        <div className="relative mb-2">
          <div className="bg-black/5 flex w-full items-center rounded-lg px-2 h-9 transition-all focus-within:bg-black/10">
            <span className="material-symbols-outlined text-ios-gray !text-[20px] ml-1">search</span>
            <input className="bg-transparent border-none focus:ring-0 w-full text-[17px] placeholder:text-ios-gray/80 py-0 pl-2" placeholder="搜索品种、地区..." type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-4 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setPriceSort(priceSort === 'asc' ? 'desc' : 'asc'); setDistanceSort(false); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${!distanceSort && priceSort !== 'default' ? 'bg-ios-blue/10 text-ios-blue border border-ios-blue/20' : 'bg-white border border-ios-separator/40'}`}
          >
            价格
            <span className="material-symbols-outlined !text-[16px]">{priceSort === 'desc' ? 'arrow_downward' : 'arrow_upward'}</span>
          </button>

          <button
            onClick={() => { setDistanceSort(true); setPriceSort('default'); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${distanceSort ? 'bg-ios-blue text-white shadow-sm' : 'bg-white border border-ios-separator/40'}`}
          >
            距离最近
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="bg-white border-b border-ios-separator/30 px-4 py-4 animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-bold mb-3 text-ios-gray">高级筛选</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-ios-bg rounded-lg text-sm font-medium border border-transparent hover:border-ios-blue text-ios-blue">已实名认证</button>
            <button className="px-4 py-2 bg-ios-bg rounded-lg text-sm font-medium border border-transparent hover:border-ios-blue text-ios-blue">疫苗已打</button>
            <button className="px-4 py-2 bg-ios-bg rounded-lg text-sm font-medium border border-transparent hover:border-ios-blue text-ios-blue">驱虫已做</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-6 py-6 bg-white shadow-sm mb-4">
        {CATEGORIES.map(cat => (
          <button key={cat.label} onClick={() => setActiveCategory(cat.label)} className="flex flex-col items-center gap-1.5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeCategory === cat.label ? 'bg-ios-blue text-white shadow-lg' : 'bg-ios-bg'}`}>
              <span className={`material-symbols-outlined !text-[32px] ${activeCategory === cat.label ? 'text-white' : cat.color}`}>{cat.icon}</span>
            </div>
            <span className={`text-[11px] font-bold ${activeCategory === cat.label ? 'text-ios-blue' : 'text-ios-gray'}`}>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-2 pb-24">
        {filteredItems.map(item => (
          <div key={item.id} className="flex flex-col group cursor-pointer" onClick={() => onItemClick(item)}>
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-white">
              <img alt={item.name} className="w-full h-full object-cover group-active:scale-105 transition-transform duration-500" src={item.image} />
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 ios-blur rounded text-[10px] text-white font-bold backdrop-blur-sm">
                {item.distance}km
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                <span className="text-white font-bold text-[16px]">¥{item.price.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-2 px-1">
              <h3 className="font-semibold text-[15px] truncate text-[#1C1C1E]">{item.name}</h3>
              <p className="text-[12px] text-ios-gray mt-0.5 font-medium">{item.age} • {item.gender}</p>
              <div className="flex items-center gap-0.5 mt-1 text-ios-gray">
                <span className="material-symbols-outlined !text-[12px]">location_on</span>
                <span className="text-[10px] truncate">{item.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div >
  );
};

export default MarketScreen;
