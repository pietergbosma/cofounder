import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Briefcase, BarChart3 } from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { investmentService, projectService, mrrService } from '../services/api';
import { Investment, MRRData } from '../types';

export const InvestorPortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const portfolio = await investmentService.getInvestorPortfolio(user!.id);
      setInvestments(portfolio.investments);
      setTotalInvested(portfolio.totalInvested);
      setPortfolioCount(portfolio.portfolioCount);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-4">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Portfolio</h1>
          <p className="text-gray-600">Track your investments and portfolio performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalInvested.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Portfolio Companies</p>
                <p className="text-2xl font-bold text-gray-900">{portfolioCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Investments</p>
                <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Investments List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Investments</h2>
          
          {investments.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
              <p className="text-gray-600">Start investing in promising startups</p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => (
                <div
                  key={investment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {investment.round?.project?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {investment.round?.round_name} • {investment.round?.project?.category}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Invested: </span>
                          <span className="font-semibold text-gray-900">
                            ${investment.amount_invested.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Equity: </span>
                          <span className="font-semibold text-gray-900">
                            {investment.round?.equity_offered}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Date: </span>
                          <span className="font-semibold text-gray-900">
                            {new Date(investment.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      investment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {investment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </div>
                  </div>
                  {investment.notes && (
                    <p className="mt-3 text-sm text-gray-600 italic">
                      Note: {investment.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
