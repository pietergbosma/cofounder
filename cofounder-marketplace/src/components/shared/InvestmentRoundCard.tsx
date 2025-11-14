import React from 'react';
import { InvestmentRound } from '../../types';
import { Card } from '../ui/Card';
import { TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';

interface InvestmentRoundCardProps {
  round: InvestmentRound;
  onClick?: () => void;
}

export const InvestmentRoundCard: React.FC<InvestmentRoundCardProps> = ({ round, onClick }) => {
  const progress = (round.amount_raised / round.amount_seeking) * 100;
  const daysLeft = Math.ceil((new Date(round.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{round.project?.title}</h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {round.round_name}
              </span>
              <span className="text-sm text-gray-600">{round.project?.category}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            round.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {round.status === 'open' ? 'Open' : 'Closed'}
          </div>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-2">{round.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Seeking</span>
            </div>
            <span className="font-semibold text-gray-900">
              ${round.amount_seeking.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Raised</span>
            </div>
            <span className="font-semibold text-green-600">
              ${round.amount_raised.toLocaleString()} ({progress.toFixed(0)}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>Valuation</span>
            </div>
            <span className="font-semibold text-gray-900">
              ${(round.valuation / 1000000).toFixed(1)}M
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Deadline</span>
            </div>
            <span className={`font-semibold ${daysLeft < 7 ? 'text-red-600' : 'text-gray-900'}`}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>${round.min_investment.toLocaleString()} - ${round.max_investment.toLocaleString()}</span>
          <span>{round.equity_offered}% equity</span>
        </div>
      </div>
    </Card>
  );
};
