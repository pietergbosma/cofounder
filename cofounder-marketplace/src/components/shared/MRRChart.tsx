import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MRRData } from '../../types';

interface MRRChartProps {
  data: MRRData[];
  title?: string;
}

export const MRRChart: React.FC<MRRChartProps> = ({ data, title }) => {
  const chartData = data.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    revenue: item.revenue,
  }));

  const currentMRR = data.length > 0 ? data[data.length - 1].revenue : 0;
  const previousMRR = data.length > 1 ? data[data.length - 2].revenue : 0;
  const growth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>}
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Current MRR</p>
          <p className="text-2xl font-bold text-blue-600">${currentMRR.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Previous Month</p>
          <p className="text-2xl font-bold text-green-600">${previousMRR.toLocaleString()}</p>
        </div>
        <div className={`rounded-lg p-4 ${growth >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-sm text-gray-600 mb-1">Growth</p>
          <p className={`text-2xl font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            name="Monthly Revenue"
            dot={{ fill: '#2563eb' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
