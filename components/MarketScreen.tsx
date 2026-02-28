
import React, { useState, useMemo } from 'react';
import { MarketItem } from '../types';

export const MARKET_ITEMS: MarketItem[] = [
  {
    id: '1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-JUUlCCFZwj2FhOi6ohwHJNRB1u4qfQk9APRwcD1RT7dQ2o2YOlPtYo49DyBV3lkHx6vmlddac-4fFowdv7HoTvdA5PYsx65Wi6hJlGE9kiyGfY39qo0rAFjK9AZcD2lcEQ2ODsepUnCNYXqUAcgcw3PWjGrON4yIlBdjt0d3ZyRgIT421OOCKDunQ_eMxrm1K7RCHbGTPjrYcY8PQYw1lzTcK_IFyu_mWqGa5YOji2POP2fvcXEvVJv5cPExJjSUlgKPhkLdbI4',
    name: '金毛寻回犬',
    category: '狗狗',
    breed: '金毛',
    price: 8500,
    verified: true,
    age: '3个月',
    gender: '公',
    location: '上海 浦东新区',
    distance: 1.2,
    vaccines: true,
    dewormed: true,
  },
  {
    id: '2',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCisZzRdw6Mu6wtJNezaPgVjrFKV-AYmQhzbAYlRy91ZMjKYTnqqEDesSbIrKu16BTmwyodUAD9LW6vyZHd1Szr80fqN6J8GqrYOAn8T86jZ6GIeLJbfb1K2DIw24-aiWtblPck_XNiTR7P7Xwc0SyqSDf-MK4yVGrEO4vs2RrDoYN23BnjkKXJ4BvuZGsoMW6a6Pth6CtyU--mhQ50gwQdA_itYPsmAxv3vpftKYlfc0qb9SOf-bXAHpLWF8dOOOnhNxwaL3UCZVs',
    name: '英短蓝猫',
    category: '猫咪',
    breed: '英短',
    price: 5800,
    verified: false,
    age: '2个月',
    gender: '母',
    location: '上海 静安区',
    distance: 4.5,
    vaccines: true,
    dewormed: false,
  },
  {
    id: '3',
    image: 'https://picsum.photos/seed/bird1/400/500',
    name: '虎皮鹦鹉',
    category: '鸟类',
    breed: '虎皮鹦鹉',
    price: 620,
    verified: true,
    age: '5个月',
    gender: '公',
    location: '上海 长宁区',
    distance: 2.8,
    vaccines: false,
    dewormed: false,
  },
  {
    id: '4',
    image: 'https://picsum.photos/seed/reptile1/400/500',
    name: '玉米蛇',
    category: '爬宠',
    breed: '玉米蛇',
    price: 350,
    verified: false,
    age: '8个月',
    gender: '亚成体',
    location: '上海 徐汇区',
    distance: 6.1,
    vaccines: false,
    dewormed: false,
  }
];

// ========================
// 宠物品种定义 (二级筛选)
// ========================
const PET_BREEDS: Record<string, string[]> = {
  '狗狗': ['不限', '金毛', '泰迪', '柴犬', '柯基', '比熊', '边牧', '拉布拉多', '萨摩耶', '哈士奇', '阿拉斯加', '德牧', '法斗', '雪纳瑞', '其他犬种'],
  '猫咪': ['不限', '英短', '美短', '布偶', '蓝猫', '渐层', '暹罗', '缅因', '加菲', '无毛猫', '折耳猫', '波斯猫', '其他猫种'],
  '鸟类': ['不限', '虎皮', '玄凤', '牡丹', '和尚', '金太阳', '灰机', '其他鸟类'],
  '爬宠': ['不限', '玉米蛇', '球蟒', '守宫', '鬣蜥', '陆龟', '水龟', '其他爬宠'],
  '水族': ['不限', '金鱼', '锦鲤', '孔雀鱼', '灯鱼', '斗鱼', '锦带', '其他鱼类'],
};

// ========================
// 宠物分类定义 (全集)
// ========================
const ALL_CATEGORY_DATA = [
  { label: '狗狗', icon: 'pets', color: 'text-orange-400' },
  { label: '猫咪', icon: 'pets', color: 'text-yellow-500' },
  { label: '鸟类', icon: 'flutter_dash', color: 'text-blue-400' },
  { label: '爬宠', icon: 'egg', color: 'text-emerald-500' },
  { label: '水族', icon: 'water', color: 'text-cyan-500' },
  { label: '仓鼠', icon: 'cruelty_free', color: 'text-pink-400' },
  { label: '兔子', icon: 'cruelty_free', color: 'text-purple-400' },
  { label: '豚鼠', icon: 'potted_plant', color: 'text-orange-300' },
  { label: '龙猫', icon: 'Pets', color: 'text-slate-400' },
  { label: '蜘蛛', icon: 'bug_report', color: 'text-red-400' },
  { label: '蝎子', icon: 'bug_report', color: 'text-amber-600' },
  { label: '昆虫', icon: 'emoji_nature', color: 'text-green-500' },
  { label: '马', icon: 'bedroom_baby', color: 'text-brown-500' },
  { label: '猪', icon: 'savings', color: 'text-pink-300' },
  { label: '牛', icon: 'cruelty_free', color: 'text-gray-600' },
  { label: '羊', icon: 'cloud', color: 'text-gray-400' },
  { label: '其他', icon: 'more_horiz', color: 'text-gray-500' },
];

const BASE_CATEGORIES = [
  { label: '全部', icon: 'apps', color: 'text-gray-500' },
  ...ALL_CATEGORY_DATA.slice(0, 4)
];

const AGE_OPTIONS = ['不限', '0-3个月', '3-6个月', '6-12个月', '1岁以上'];
const PRICE_RANGES = ['不限', '500以下', '500-2000', '2000-8000', '8000以上'];

interface MarketScreenProps {
  items: MarketItem[];
  onItemClick: (item: MarketItem) => void;
  onPublishClick?: () => void;
}

const MarketScreen: React.FC<MarketScreenProps> = ({ items, onItemClick, onPublishClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedBreed, setSelectedBreed] = useState('不限');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');
  const [distanceSort, setDistanceSort] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState(false);

  // 分类选择搜索
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');

  const [selectedGender, setSelectedGender] = useState<'公' | '母' | '亚成体' | null>(null);
  const [selectedAge, setSelectedAge] = useState('不限');
  const [selectedPriceRange, setSelectedPriceRange] = useState('不限');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterVaccine, setFilterVaccine] = useState(false);
  const [filterDewormed, setFilterDewormed] = useState(false);

  // 过滤分类列表
  const filteredCategories = useMemo(() => {
    if (!catSearchQuery.trim()) return ALL_CATEGORY_DATA;
    return ALL_CATEGORY_DATA.filter(c => c.label.includes(catSearchQuery));
  }, [catSearchQuery]);

  const activeFilterCount = [
    selectedGender !== null,
    selectedAge !== '不限',
    selectedPriceRange !== '不限',
    filterVerified,
    filterVaccine,
    filterDewormed,
  ].filter(Boolean).length;

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

    // 品种筛选
    if (activeCategory !== '全部' && selectedBreed !== '不限') {
      filtered = filtered.filter(item => item.breed?.includes(selectedBreed) || item.name.includes(selectedBreed));
    }

    if (selectedGender) {
      filtered = filtered.filter(item => item.gender === selectedGender);
    }

    if (filterVerified) {
      filtered = filtered.filter(item => item.verified);
    }

    if (filterVaccine) {
      filtered = filtered.filter(item => item.vaccines);
    }

    if (filterDewormed) {
      filtered = filtered.filter(item => item.dewormed);
    }

    if (selectedPriceRange !== '不限') {
      filtered = filtered.filter(item => {
        if (selectedPriceRange === '500以下') return item.price < 500;
        if (selectedPriceRange === '500-2000') return item.price >= 500 && item.price < 2000;
        if (selectedPriceRange === '2000-8000') return item.price >= 2000 && item.price < 8000;
        if (selectedPriceRange === '8000以上') return item.price >= 8000;
        return true;
      });
    }

    if (distanceSort) {
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (priceSort === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [items, searchQuery, activeCategory, selectedBreed, priceSort, distanceSort, selectedGender, filterVerified, filterVaccine, filterDewormed, selectedPriceRange]);

  const resetFilters = () => {
    setSelectedGender(null);
    setSelectedBreed('不限');
    setSelectedAge('不限');
    setSelectedPriceRange('不限');
    setFilterVerified(false);
    setFilterVaccine(false);
    setFilterDewormed(false);
    setPriceSort('default');
    setDistanceSort(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg relative">
      <header className="sticky top-0 z-40 bg-ios-card/80 ios-blur border-b border-ios-separator/30 px-4 pt-12 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-bold tracking-tight">宠物市集</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[14px] font-medium transition-colors relative ${showFilters ? 'bg-ios-text text-ios-card' : 'bg-ios-bg text-ios-text'}`}
          >
            <span className="material-symbols-outlined !text-[18px]">filter_list</span>
            筛选
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ios-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative mb-2">
          <div className="bg-ios-bg/50 flex w-full items-center rounded-lg px-2 h-9 transition-all focus-within:bg-ios-bg/80">
            <span className="material-symbols-outlined text-ios-gray !text-[20px] ml-1">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-[17px] placeholder:text-ios-gray/80 py-0 pl-2"
              placeholder="寻找心仪的宠物..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setPriceSort(priceSort === 'asc' ? 'desc' : priceSort === 'desc' ? 'default' : 'asc'); setDistanceSort(false); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${!distanceSort && priceSort !== 'default' ? 'bg-ios-blue/10 text-ios-blue border border-ios-blue/20' : 'bg-ios-card border border-ios-separator/40'}`}
          >
            价格
            <span className="material-symbols-outlined !text-[15px]">
              {priceSort === 'desc' ? 'arrow_downward' : priceSort === 'asc' ? 'arrow_upward' : 'unfold_more'}
            </span>
          </button>
          <button
            onClick={() => { setDistanceSort(!distanceSort); setPriceSort('default'); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${distanceSort ? 'bg-ios-blue text-white' : 'bg-ios-card border border-ios-separator/40'}`}
          >
            距离最近
          </button>
          <button
            onClick={() => setFilterVerified(!filterVerified)}
            className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${filterVerified ? 'bg-green-500 text-white' : 'bg-ios-card border border-ios-separator/40'}`}
          >
            已认证
          </button>
        </div>
      </header>

      {/* 高级筛选区 */}
      {showFilters && (
        <div className="bg-ios-card border-b border-ios-separator px-4 py-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold">高级筛选</h3>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="text-ios-blue text-[13px] font-medium text-ios-gray">重置</button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[12px] text-ios-gray font-bold mb-2 uppercase tracking-wider">健康保证</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '疫苗已打', state: filterVaccine, toggle: () => setFilterVaccine(!filterVaccine) },
                  { label: '驱虫已做', state: filterDewormed, toggle: () => setFilterDewormed(!filterDewormed) },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.toggle}
                    className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${item.state ? 'bg-ios-blue text-white' : 'bg-ios-bg border border-ios-separator/40'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[12px] text-ios-gray font-bold mb-2 uppercase tracking-wider">性别</p>
              <div className="flex gap-2">
                {(['公', '母', '亚成体'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(selectedGender === g ? null : g)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${selectedGender === g ? 'bg-ios-blue text-white shadow-sm' : 'bg-ios-bg border border-ios-separator/40'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[12px] text-ios-gray font-bold mb-2 uppercase tracking-wider">价格区间</p>
              <div className="grid grid-cols-3 gap-2">
                {PRICE_RANGES.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedPriceRange(r)}
                    className={`py-2 rounded-xl text-[13px] font-medium transition-all ${selectedPriceRange === r ? 'bg-ios-blue text-white shadow-sm' : 'bg-ios-bg border border-ios-separator/40'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 宠物分类 (横向滑动) */}
      <div className="bg-ios-card flex justify-between items-center px-4 py-6 shadow-sm border-b border-ios-separator transition-colors duration-300">
        {BASE_CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => {
              if (cat.label === '全部') {
                setShowAllCategoriesModal(true);
              } else {
                setActiveCategory(cat.label);
                setSelectedBreed('不限'); // 切换大类重置品种
              }
            }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeCategory === cat.label || (cat.label === '全部' && activeCategory !== '狗狗' && activeCategory !== '猫咪' && activeCategory !== '鸟类' && activeCategory !== '爬宠' && activeCategory !== '全部') ? 'bg-ios-bg shadow-md ring-2 ring-ios-text/5' : 'bg-ios-bg/50 border border-ios-separator/20'}`}>
              <span className={`material-symbols-outlined !text-[32px] ${activeCategory === cat.label || (cat.label === '全部' && !['狗狗', '猫咪', '鸟类', '爬宠', '全部'].includes(activeCategory)) ? 'text-ios-text' : cat.color}`}>{cat.icon}</span>
            </div>
            <span className={`text-[11px] font-bold ${activeCategory === cat.label || (cat.label === '全部' && !['狗狗', '猫咪', '鸟类', '爬宠', '全部'].includes(activeCategory)) ? 'text-ios-text' : 'text-ios-gray'}`}>{cat.label === '全部' && activeCategory !== '全部' && !['狗狗', '猫咪', '鸟类', '爬宠'].includes(activeCategory) ? activeCategory : cat.label}</span>
          </button>
        ))}
      </div>

      {/* 二级品种筛选条 - 仅在有品种数据的大类下显示 */}
      {activeCategory !== '全部' && PET_BREEDS[activeCategory] && (
        <div className="bg-ios-card px-4 pb-4 border-b border-ios-separator animate-in slide-in-from-top-1 duration-300 transition-colors">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {PET_BREEDS[activeCategory].map(breed => (
              <button
                key={breed}
                onClick={() => setSelectedBreed(breed)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${selectedBreed === breed ? 'bg-ios-blue/10 text-ios-blue' : 'bg-ios-bg text-ios-gray'}`}
              >
                {breed}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 结果计数 */}
      <div className="px-4 pb-2 flex items-baseline gap-2">
        <span className="text-[13px] text-ios-gray font-medium">共 {filteredItems.length} 个结果</span>
        {activeCategory !== '全部' && (
          <div className="px-2 py-0.5 bg-ios-blue/10 rounded flex items-center gap-1">
            <span className="text-[11px] text-ios-blue font-bold">{activeCategory}</span>
            <button onClick={() => setActiveCategory('全部')} className="text-ios-blue">
              <span className="material-symbols-outlined !text-[12px] translate-y-px">close</span>
            </button>
          </div>
        )}
      </div>

      {/* 集市内容 */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-2 pb-24">
          {filteredItems.map(item => (
            <div key={item.id} className="flex flex-col group cursor-pointer" onClick={() => onItemClick(item)}>
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-ios-bg transition-colors">
                <img alt={item.name} className="w-full h-full object-cover group-active:scale-105 transition-transform duration-500" src={item.image} />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 ios-blur rounded text-[10px] text-white font-bold backdrop-blur-sm">
                  {(item.distance || 0).toFixed(1)}km
                </div>
                {item.verified && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="material-symbols-outlined !text-[14px] text-white">verified</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/20 text-white">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] opacity-80">¥</span>
                    <span className="text-[18px] font-bold">{item.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 px-1">
                <h3 className="font-semibold text-[15px] truncate text-ios-text">{item.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-ios-gray font-medium">{item.age}</span>
                  <span className="w-0.5 h-0.5 bg-ios-gray/30 rounded-full"></span>
                  <span className="text-[11px] text-ios-gray font-medium">{item.gender}</span>
                </div>
                {(item.vaccines || item.dewormed) && (
                  <div className="flex gap-1 mt-1.5">
                    {item.vaccines && <span className="text-[9px] bg-green-50 text-green-600 px-1 py-0.5 rounded border border-green-100">已打疫苗</span>}
                    {item.dewormed && <span className="text-[9px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded border border-blue-100">已驱虫</span>}
                  </div>
                )}
                <div className="flex items-center gap-0.5 mt-1.5 text-ios-gray">
                  <span className="material-symbols-outlined !text-[12px]">location_on</span>
                  <span className="text-[10px] truncate">{item.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-ios-gray">
          <span className="material-symbols-outlined !text-[64px] opacity-10 mb-4">search_off</span>
          <p className="text-lg font-medium">暂时没有找到相关宠物</p>
          <button onClick={resetFilters} className="mt-4 text-ios-blue font-bold px-6 py-2 bg-ios-blue/5 rounded-full">
            重置筛选条件
          </button>
        </div>
      )}

      {/* 悬浮发布按钮 */}
      <button
        onClick={onPublishClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-ios-blue text-white rounded-full flex items-center justify-center shadow-xl shadow-ios-blue/30 active:scale-90 transition-transform z-40"
      >
        <span className="material-symbols-outlined !text-[28px]">add</span>
      </button>

      {/* 全部分类搜索 Modal */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
          <div className="w-full bg-ios-card rounded-t-[32px] max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-400 border-t border-ios-separator transition-all duration-300">
            <div className="w-12 h-1.5 bg-ios-separator/30 rounded-full mx-auto mt-3 mb-1"></div>
            <header className="px-6 py-4 flex items-center justify-between border-b border-ios-separator">
              <h2 className="text-xl font-bold">全部分类</h2>
              <button
                onClick={() => { setShowAllCategoriesModal(false); setCatSearchQuery(''); }}
                className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center"
              >
                <span className="material-symbols-outlined !text-[18px] text-ios-gray">close</span>
              </button>
            </header>

            <div className="p-4 bg-ios-card sticky top-0 border-b border-ios-separator transition-colors duration-300">
              <div className="bg-ios-bg rounded-xl flex items-center px-3 h-11 border border-ios-separator">
                <span className="material-symbols-outlined text-ios-gray !text-[20px]">search</span>
                <input
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] pl-2"
                  placeholder="搜分类 (如: 仓鼠, 龙猫...)"
                  value={catSearchQuery}
                  onChange={(e) => setCatSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-12 no-scrollbar">
              <div className="grid grid-cols-4 gap-x-2 gap-y-6 pt-2">
                <button
                  onClick={() => { setActiveCategory('全部'); setShowAllCategoriesModal(false); }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-2xl bg-ios-bg flex items-center justify-center">
                    <span className="material-symbols-outlined !text-[28px] text-gray-500">apps</span>
                  </div>
                  <span className="text-[12px] font-medium text-ios-gray">全部</span>
                </button>
                {filteredCategories.map(c => (
                  <button
                    key={c.label}
                    onClick={() => { setActiveCategory(c.label); setShowAllCategoriesModal(false); setCatSearchQuery(''); }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeCategory === c.label ? 'bg-ios-blue text-white shadow-lg' : 'bg-ios-bg'}`}>
                      <span className={`material-symbols-outlined !text-[28px] ${activeCategory === c.label ? 'text-white' : c.color}`}>{c.icon}</span>
                    </div>
                    <span className={`text-[12px] font-bold ${activeCategory === c.label ? 'text-ios-blue' : 'text-ios-gray'}`}>{c.label}</span>
                  </button>
                ))}
              </div>
              {filteredCategories.length === 0 && (
                <div className="py-20 text-center text-ios-gray">
                  <p>未找到该分类，请尝试其他关键词</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketScreen;
