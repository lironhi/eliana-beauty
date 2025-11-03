interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  title?: string;
  color?: string;
}

export default function LineChart({ data, title, color = '#ec4899' }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const chartHeight = 200;
  const chartWidth = 100;

  // Create SVG path for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * chartWidth;
    const y = chartHeight - ((item.value - minValue) / range) * chartHeight;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;

  // Create area path (fill under the line)
  const areaPath = `${linePath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ height: '200px' }}
        >
          {/* Area fill */}
          <path
            d={areaPath}
            fill={color}
            fillOpacity="0.1"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1 || 1)) * chartWidth;
            const y = chartHeight - ((item.value - minValue) / range) * chartHeight;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  className="hover:r-4 transition-all"
                />
                <title>{`${item.label}: ${item.value}`}</title>
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          {data.map((item, index) => {
            // Show every nth label to avoid crowding
            const showEvery = Math.ceil(data.length / 7);
            if (index % showEvery === 0 || index === data.length - 1) {
              return (
                <span key={index} className="flex-shrink-0">
                  {item.label}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Legend with stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
        <div>
          <span className="text-gray-600">Max: </span>
          <span className="font-semibold text-gray-900">{maxValue}</span>
        </div>
        <div>
          <span className="text-gray-600">Min: </span>
          <span className="font-semibold text-gray-900">{minValue}</span>
        </div>
        <div>
          <span className="text-gray-600">Avg: </span>
          <span className="font-semibold text-gray-900">
            {Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
          </span>
        </div>
      </div>
    </div>
  );
}
