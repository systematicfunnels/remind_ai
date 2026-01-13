'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', reminders: 45, users: 12 },
  { name: 'Tue', reminders: 52, users: 15 },
  { name: 'Wed', reminders: 48, users: 18 },
  { name: 'Thu', reminders: 61, users: 22 },
  { name: 'Fri', reminders: 55, users: 25 },
  { name: 'Sat', reminders: 67, users: 28 },
  { name: 'Sun', reminders: 72, users: 31 },
];

export default function AdminChart() {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorReminders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #1e293b', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            itemStyle={{ color: '#6366f1' }}
          />
          <Area 
            type="monotone" 
            dataKey="reminders" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorReminders)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
