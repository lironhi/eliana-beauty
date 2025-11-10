import { useState, useMemo } from 'react';

interface LineChartProps {
  data: Array<{ label: string; value: number; date?: Date }>;
  title?: string;
  color?: string;
  showFilters?: boolean;
}

type TimeFilter = '7days' | '30days' | 'thisMonth';

export default function LineChart({
  data,
  title,
  color = '#ec4899',
  showFilters = true
}: LineChartProps) {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('7days');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showAllValues, setShowAllValues] = useState<boolean>(false);

  const filteredData = useMemo(() => {
    if (!showFilters || !data[0]?.date) return data;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (activeFilter) {
      case '7days': {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        return data.filter(item => item.date && item.date >= sevenDaysAgo);
      }
      case '30days': {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29);
        return data.filter(item => item.date && item.date >= thirtyDaysAgo);
      }
      case 'thisMonth': {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return data.filter(item => item.date && item.date >= firstDayOfMonth);
      }
      default:
        return data;
    }
  }, [data, activeFilter, showFilters]);

  if (filteredData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 font-medium">No data available</p>
          <p className="text-xs text-gray-400 mt-1">Try selecting a different time period</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...filteredData.map(d => d.value));
  const minValue = Math.min(...filteredData.map(d => d.value), 0);
  const range = maxValue - minValue || 1;
  const avgValue = Math.round(filteredData.reduce((sum, d) => sum + d.value, 0) / filteredData.length);

  const chartHeight = 200;
  const chartWidth = 100;

  // Create SVG path for the line
  const points = filteredData.map((item, index) => {
    const x = (index / (filteredData.length - 1 || 1)) * chartWidth;
    const y = chartHeight - ((item.value - minValue) / range) * chartHeight;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;

  // Create area path (fill under the line)
  const areaPath = `${linePath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  const filters = [
    { id: '7days' as TimeFilter, label: '7 Days', icon: '📅' },
    { id: '30days' as TimeFilter, label: '30 Days', icon: '📊' },
    { id: 'thisMonth' as TimeFilter, label: 'This Month', icon: '📆' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300 group">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          {title && (
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle to show all values */}
          <button
            onClick={() => setShowAllValues(!showAllValues)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              showAllValues
                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Toggle value labels"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="hidden sm:inline">{showAllValues ? 'Hide' : 'Show'} Values</span>
          </button>

          {showFilters && (
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <span className="text-sm">{filter.icon}</span>
                  <span className="hidden sm:inline">{filter.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-blue-600">Max</span>
          </div>
          <p className="text-xl font-bold text-blue-900">{maxValue}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-purple-600">Avg</span>
          </div>
          <p className="text-xl font-bold text-purple-900">{avgValue}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3 border border-pink-200">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-pink-600">Min</span>
          </div>
          <p className="text-xl font-bold text-pink-900">{minValue}</p>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
        {/* Hover tooltip */}
        {hoveredPoint !== null && filteredData[hoveredPoint] && (
          <div
            className="absolute bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-2xl z-50 pointer-events-none border-2 border-purple-400"
            style={{
              left: `${(hoveredPoint / (filteredData.length - 1 || 1)) * 100}%`,
              top: '-60px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-purple-300 text-xs font-semibold">{filteredData[hoveredPoint].label}</span>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span className="text-lg font-bold">{filteredData[hoveredPoint].value}</span>
                <span className="text-xs text-gray-300">appointments</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="border-[6px] border-transparent border-t-purple-400"></div>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ height: '280px' }}
        >
          {/* Grid lines */}
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={(percent / 100) * chartHeight}
              x2={chartWidth}
              y2={(percent / 100) * chartHeight}
              stroke="#e5e7eb"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

          {/* Area fill with gradient */}
          <path
            d={areaPath}
            fill={`url(#gradient-${color})`}
          />

          {/* Line with enhanced styling */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
          />

          {/* Data points */}
          {filteredData.map((item, index) => {
            const x = (index / (filteredData.length - 1 || 1)) * chartWidth;
            const y = chartHeight - ((item.value - minValue) / range) * chartHeight;
            const isHovered = hoveredPoint === index;

            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "5" : "3.5"}
                  fill="white"
                  stroke={color}
                  strokeWidth="2.5"
                  className="transition-all cursor-pointer hover:r-5"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={color}
                    fillOpacity="0.2"
                    className="animate-ping"
                  />
                )}

                {/* Show value label if enabled */}
                {showAllValues && (
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    className="text-[8px] font-bold fill-gray-700 pointer-events-none"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    {item.value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* X-axis labels - Show all labels with better spacing */}
        <div className="relative mt-8 pt-2 border-t border-gray-200">
          <div className="flex justify-between items-end" style={{ height: '40px' }}>
            {filteredData.map((item, index) => {
              const isHighlighted = index === 0 || index === filteredData.length - 1 || index === Math.floor(filteredData.length / 2);
              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 relative group cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Tick mark */}
                  <div className={`w-px absolute -top-2 transition-all ${
                    hoveredPoint === index ? 'h-3 bg-purple-500' : isHighlighted ? 'h-2 bg-gray-400' : 'h-1 bg-gray-300'
                  }`}></div>

                  {/* Label */}
                  <span
                    className={`text-[9px] font-medium transition-all whitespace-nowrap mt-1 ${
                      hoveredPoint === index
                        ? 'text-purple-600 font-bold scale-110'
                        : isHighlighted
                          ? 'text-gray-700 font-semibold'
                          : 'text-gray-400'
                    }`}
                    style={{
                      transform: hoveredPoint === index ? 'scale(1.1)' : 'scale(1)',
                      transformOrigin: 'top center'
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Value indicator on hover */}
                  {hoveredPoint === index && (
                    <span className="absolute -top-6 bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-lg animate-in fade-in zoom-in duration-200">
                      {item.value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced summary */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <span className="text-gray-600">Total: <span className="font-bold text-gray-900">{filteredData.reduce((sum, d) => sum + d.value, 0)}</span></span>
        </div>
        <span className="text-gray-500">{filteredData.length} data points</span>
      </div>
    </div>
  );
}
