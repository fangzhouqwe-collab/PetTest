import React from 'react';
import { Search } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({ 
  columns, 
  data, 
  loading, 
  onSearch, 
  searchPlaceholder = '搜索...', 
  actions 
}: DataTableProps<T>) {
  return (
    <div className="bg-ios-card rounded-2xl shadow-sm border border-ios-separator overflow-hidden flex flex-col">
      {/* 搜索/工具栏 */}
      {onSearch && (
        <div className="p-4 border-b border-ios-separator flex items-center justify-between bg-ios-bg/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-ios-separator bg-ios-card focus:outline-none focus:ring-2 focus:ring-ios-blue/30 transition-all text-sm"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* 表格主体 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ios-bg/80 border-b border-ios-separator text-sm text-ios-gray">
              {columns.map((col, idx) => (
                <th key={idx} className="p-4 font-bold whitespace-nowrap" style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
              {actions && <th className="p-4 font-bold text-right" style={{ width: '120px' }}>操作</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-ios-gray">
                  <div className="w-6 h-6 border-2 border-ios-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  数据加载中...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-ios-gray">
                  暂无相关数据
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className="border-b border-ios-separator/50 hover:bg-ios-bg/30 transition-colors text-sm"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-4">
                      {typeof col.accessor === 'function' 
                        ? col.accessor(row) 
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-4 text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
