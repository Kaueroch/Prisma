import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';

interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string; percent?: number }>;
}

const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl">
        <p className="text-zinc-300 font-medium text-sm mb-1">{data.name}</p>
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{formatBRL(data.value)}</span>
          {data.percent !== undefined && (
            <span className="text-zinc-500 text-xs font-semibold">{data.percent}%</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function DonutChart({ data }: DonutChartProps) {
  // Filter out 0 value data to avoid React Recharts warnings
  const validData = data.filter(d => d.value > 0);

  if (validData.length === 0) {
    return (
      <div className="w-full h-full rounded-full border-[8px] border-zinc-800"></div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            cornerRadius={999}
          >
            {validData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
