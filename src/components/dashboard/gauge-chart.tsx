"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface GaugeChartProps {
  value: number;
  label: string;
  color: string;
}

export function GaugeChart({ value, label, color }: GaugeChartProps) {
  // Value 0-100
  const data = [
    { name: "Value", value: value, color: color },
    { name: "Remaining", value: 100 - value, color: "#e2e8f0" },
  ];

  // Calculate Needle Rotation
  // 0 = 180deg (Left), 100 = 0deg (Right)
  // Actually typically gauges go 180 (left) to 0 (right)?
  // Pie startAngle={180} endAngle={0}
  const rotation = 180 - (value / 100) * 180;

  return (
    <div className="relative h-[200px] w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient
              id={`gaugeGradient-${label}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={65}
            outerRadius={85}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            cornerRadius={10}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? `url(#gaugeGradient-${label})` : "#f1f5f9"}
                className="transition-all duration-500"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Value Text centered */}
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 text-center">
        <span className="text-4xl font-black text-slate-800 tracking-tighter drop-shadow-sm">
          {value}%
        </span>
      </div>

      {/* Label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  );
}
