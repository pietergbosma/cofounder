import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Briefcase, DollarSign, Plus } from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { InvestmentRoundCard } from '../components/shared/InvestmentRoundCard';
import { useAuth } from '../contexts/AuthContext';
import { investmentService, investmentRoundService } from '../services/api';
import { InvestmentRound } from '../types';

export const InvestorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [openRounds, setOpenRounds] = useState<InvestmentRound[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [portfolio, rounds] = await Promise.all([
        investmentService.getInvestorPortfolio(user!.id),
        investmentRoundService.getOpenRounds(),
      ]);
      
      setTotalInvested(portfolio.totalInvested);
      setPortfolioCount(portfolio.portfolioCount);
      setOpenRounds(rounds.slice(0, 3)); // Show top 3
    } catch (error) {
      console.error('Failed to load dashboard:', error);
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
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Here's your investment dashboard</p>
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
                <p className="text-sm text-gray-600 mb-1">Open Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">{openRounds.length}+</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Featured Opportunities */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Opportunities</h2>
            <Link to="/investment-opportunities">
              <Button variant="outline">
                <span>View All</span>
              </Button>
            </Link>
          </div>

          {openRounds.length === 0 ? (
            <Card className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No opportunities available
              </h3>
              <p className="text-gray-600">Check back later for new investment rounds</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {openRounds.map((round) => (
                <Link key={round.id} to={`/investment-opportunities/${round.id}`}>
                  <InvestmentRoundCard round={round} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/investment-opportunities">
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Browse Opportunities</h3>
                  <p className="text-sm text-gray-600">Find startups seeking funding</p>
                </div>
              </div>
            </Link>
            
            <Link to="/investor-portfolio">
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Portfolio</h3>
                  <p className="text-sm text-gray-600">Track your investments</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
