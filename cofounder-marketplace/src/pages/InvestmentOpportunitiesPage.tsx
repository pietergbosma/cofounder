import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { InvestmentRoundCard } from '../components/shared/InvestmentRoundCard';
import { investmentRoundService, projectService } from '../services/api';
import { InvestmentRound } from '../types';

export const InvestmentOpportunitiesPage: React.FC = () => {
  const [rounds, setRounds] = useState<InvestmentRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadRounds();
  }, [categoryFilter]);

  const loadRounds = async () => {
    try {
      setLoading(true);
      const data = await investmentRoundService.getOpenRounds({
        category: categoryFilter || undefined,
      });
      setRounds(data);
    } catch (error) {
      console.error('Failed to load investment rounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRounds = rounds.filter((round) => {
    const matchesSearch =
      !searchQuery ||
      round.project?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      round.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const categories = ['Developer Tools', 'Health & Fitness', 'Education', 'Marketing'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Investment Opportunities</h1>
          </div>
          <p className="text-gray-600">
            Discover and invest in promising startups seeking funding
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by project name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-4">Loading opportunities...</p>
          </div>
        ) : filteredRounds.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {filteredRounds.length} {filteredRounds.length === 1 ? 'opportunity' : 'opportunities'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRounds.map((round) => (
                <InvestmentRoundCard
                  key={round.id}
                  round={round}
                  onClick={() => navigate(`/investment-opportunities/${round.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
