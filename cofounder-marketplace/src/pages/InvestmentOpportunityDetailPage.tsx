import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Calendar, Users, Briefcase, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MRRChart } from '../components/shared/MRRChart';
import { useAuth } from '../contexts/AuthContext';
import { investmentRoundService, projectService, mrrService, investmentService } from '../services/api';
import { InvestmentRound, MRRData } from '../types';

export const InvestmentOpportunityDetailPage: React.FC = () => {
  const { roundId } = useParams<{ roundId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [round, setRound] = useState<InvestmentRound | null>(null);
  const [mrrData, setMRRData] = useState<MRRData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investNotes, setInvestNotes] = useState('');
  const [investing, setInvesting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [roundId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const roundData = await investmentRoundService.getInvestmentRoundById(roundId!);
      if (roundData) {
        setRound(roundData);
        if (roundData.project_id) {
          const mrr = await mrrService.getMRRData(roundData.project_id);
          setMRRData(mrr);
        }
      }
    } catch (error) {
      console.error('Failed to load investment round:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!investAmount) {
      setError('Please enter an investment amount');
      return;
    }

    const amount = parseInt(investAmount);
    if (amount < round!.min_investment || amount > round!.max_investment) {
      setError(`Investment must be between $${round!.min_investment.toLocaleString()} and $${round!.max_investment.toLocaleString()}`);
      return;
    }

    setError('');
    setInvesting(true);

    try {
      await investmentService.createInvestment({
        round_id: roundId!,
        investor_id: user!.id,
        amount_invested: amount,
        status: 'pending',
        notes: investNotes,
      });

      setShowInvestModal(false);
      alert('Investment submitted successfully! The project owner will review your investment.');
      navigate('/investor-portfolio');
    } catch (err) {
      setError('Failed to submit investment');
      console.error(err);
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-4">Loading opportunity...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Investment round not found</h3>
            <Button onClick={() => navigate('/investment-opportunities')}>
              Browse Opportunities
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const progress = (round.amount_raised / round.amount_seeking) * 100;
  const daysLeft = Math.ceil((new Date(round.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/investment-opportunities')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{round.project?.title}</h1>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      {round.round_name}
                    </span>
                    <span className="text-gray-600">{round.project?.category}</span>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  round.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {round.status === 'open' ? 'Open for Investment' : 'Closed'}
                </div>
              </div>

              <p className="text-gray-700 text-lg">{round.project?.description}</p>
            </Card>

            {/* Round Description */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Round</h2>
              <p className="text-gray-700 whitespace-pre-line">{round.description}</p>
            </Card>

            {/* Terms */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
              <p className="text-gray-700 whitespace-pre-line">{round.terms}</p>
            </Card>

            {/* Traction - MRR Chart */}
            {mrrData.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Traction & MRR</h2>
                <MRRChart data={mrrData} />
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Current MRR:</strong> ${mrrData[mrrData.length - 1]?.revenue.toLocaleString() || 0}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Stats */}
            <Card className="p-6 sticky top-6">
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Raised</span>
                    <span className="font-semibold text-gray-900">
                      ${round.amount_raised.toLocaleString()} / ${round.amount_seeking.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}% funded</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Valuation</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${(round.valuation / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Equity</p>
                    <p className="text-lg font-bold text-gray-900">
                      {round.equity_offered}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Min Investment</p>
                    <p className="text-base font-semibold text-gray-900">
                      ${round.min_investment.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Investment</p>
                    <p className="text-base font-semibold text-gray-900">
                      ${round.max_investment.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Deadline</span>
                    <span className={`font-semibold ${daysLeft < 7 ? 'text-red-600' : 'text-gray-900'}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </span>
                  </div>
                </div>
              </div>

              {round.status === 'open' && user?.user_type === 'investor' && (
                <Button
                  onClick={() => setShowInvestModal(true)}
                  className="w-full"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Invest Now
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Make an Investment</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount ($)
                </label>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  min={round.min_investment}
                  max={round.max_investment}
                  step="1000"
                  placeholder={`Min: $${round.min_investment.toLocaleString()}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min: ${round.min_investment.toLocaleString()} - Max: ${round.max_investment.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={investNotes}
                  onChange={(e) => setInvestNotes(e.target.value)}
                  rows={3}
                  placeholder="Any message for the founder..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleInvest}
                  disabled={investing}
                  className="flex-1"
                >
                  {investing ? 'Submitting...' : 'Submit Investment'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInvestModal(false);
                    setError('');
                  }}
                  disabled={investing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
