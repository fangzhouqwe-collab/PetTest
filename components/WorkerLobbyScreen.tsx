import React, { useState, useEffect } from 'react';
import { ServiceWorker } from '../types';
import * as partTimeService from '../services/partTimeService';

interface Props {
  onBack: () => void;
  onBecomeWorker: () => void;
  onViewWorker: (worker: ServiceWorker) => void;
}

const WorkerLobbyScreen: React.FC<Props> = ({ onBack, onBecomeWorker, onViewWorker }) => {
  const [workers, setWorkers] = useState<ServiceWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async (q?: string) => {
    setLoading(true);
    try {
      const data = await partTimeService.getWorkerProfiles({ search: q });
      setWorkers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadWorkers(search);
  };

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg">
      <header className="sticky top-0 z-50 bg-ios-card/80 ios-blur border-b border-ios-separator pt-12 pb-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="p-2 -ml-2 text-ios-blue active:opacity-70 transition-opacity flex items-center">
            <span className="material-symbols-outlined !text-3xl">chevron_left</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight">找代喂/代遛专家</h1>
          <button onClick={onBecomeWorker} className="text-ios-blue font-bold text-sm bg-ios-blue/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
            我也要接单
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined !text-xl text-ios-gray">search</span>
          <input 
            type="text"
            className="w-full bg-ios-bg border border-ios-separator rounded-xl py-2 pl-10 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ios-blue/30"
            placeholder="搜索区域或技能类型..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue"></div>
          </div>
        ) : workers.length > 0 ? (
          <div className="space-y-4">
            {workers.map(worker => (
              <div 
                key={worker.id} 
                className="bg-ios-card rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer border border-ios-separator"
                onClick={() => onViewWorker(worker)}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    <img 
                      src={worker.workerProfile?.avatar || 'https://picsum.photos/seed/user/100/100'} 
                      className="w-16 h-16 rounded-full object-cover border border-ios-separator" 
                    />
                    {worker.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        <span className="material-symbols-outlined !text-[12px] text-white material-symbols-fill">verified</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-[16px] text-ios-text line-clamp-1 pr-2">
                        {worker.realName || worker.workerProfile?.name || '达人'}
                      </h3>
                      <div className="text-ios-red font-bold flex items-baseline whitespace-nowrap">
                        <span className="text-xs">¥</span>
                        <span className="text-lg">{worker.basePrice}</span>
                        <span className="text-[10px] text-ios-gray font-normal ml-0.5">起</span>
                      </div>
                    </div>
                    
                    <p className="text-[14px] font-medium text-ios-text mb-2 line-clamp-1">{worker.title}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] font-bold">
                        <span className="material-symbols-outlined !text-[14px] material-symbols-fill">star</span>
                        <span>{worker.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[11px] text-ios-gray border border-ios-separator px-1.5 py-0.5 rounded">
                        已接 {worker.orderCount} 单
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-ios-separator">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {worker.skills.map(skill => (
                      <span key={skill} className="bg-ios-blue/10 text-ios-blue text-[10px] font-bold px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-ios-gray text-xs">
                    <span className="material-symbols-outlined !text-[14px]">location_on</span>
                    <span className="line-clamp-1">{worker.serviceArea}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-ios-gray">
            <span className="material-symbols-outlined !text-[48px] opacity-20 mb-4">work_off</span>
            <p className="font-medium">暂时没有找到服务者简历</p>
            <p className="text-sm mt-1">换个搜索词试试？</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerLobbyScreen;
