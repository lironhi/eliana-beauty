interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  maxHeight?: number;
}

export default function BarChart({ data, title, maxHeight = 200 }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const barColor = item.color || '#ec4899';

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-900 font-semibold">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
