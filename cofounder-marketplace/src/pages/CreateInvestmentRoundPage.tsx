import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DollarSign, TrendingUp, Calendar, Percent } from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { investmentRoundService } from '../services/api';

export const CreateInvestmentRoundPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    round_name: 'Seed',
    amount_seeking: '',
    valuation: '',
    equity_offered: '',
    min_investment: '',
    max_investment: '',
    description: '',
    terms: '',
    deadline: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await investmentRoundService.createInvestmentRound({
        project_id: projectId!,
        round_name: formData.round_name,
        amount_seeking: parseInt(formData.amount_seeking),
        amount_raised: 0,
        valuation: parseInt(formData.valuation),
        equity_offered: parseFloat(formData.equity_offered),
        min_investment: parseInt(formData.min_investment),
        max_investment: parseInt(formData.max_investment),
        description: formData.description,
        terms: formData.terms,
        status: 'open',
        deadline: formData.deadline,
      });

      navigate(`/my-projects`);
    } catch (err) {
      setError('Failed to create investment round');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Investment Round</h1>
          <p className="text-gray-600">Raise capital for your project</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Round Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Round Type
              </label>
              <select
                name="round_name"
                value={formData.round_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pre-Seed">Pre-Seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C">Series C</option>
              </select>
            </div>

            {/* Amount Seeking & Valuation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Amount Seeking ($)
                </label>
                <input
                  type="number"
                  name="amount_seeking"
                  value={formData.amount_seeking}
                  onChange={handleChange}
                  required
                  min="1000"
                  step="1000"
                  placeholder="500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Valuation ($)
                </label>
                <input
                  type="number"
                  name="valuation"
                  value={formData.valuation}
                  onChange={handleChange}
                  required
                  min="10000"
                  step="10000"
                  placeholder="3000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Equity & Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Equity Offered (%)
                </label>
                <input
                  type="number"
                  name="equity_offered"
                  value={formData.equity_offered}
                  onChange={handleChange}
                  required
                  min="0.1"
                  max="100"
                  step="0.1"
                  placeholder="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Investment Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Investment ($)
                </label>
                <input
                  type="number"
                  name="min_investment"
                  value={formData.min_investment}
                  onChange={handleChange}
                  required
                  min="1000"
                  step="1000"
                  placeholder="25000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Investment ($)
                </label>
                <input
                  type="number"
                  name="max_investment"
                  value={formData.max_investment}
                  onChange={handleChange}
                  required
                  min="1000"
                  step="1000"
                  placeholder="150000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe what this funding round is for, your traction, and why investors should invest..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms & Conditions
              </label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                required
                rows={4}
                placeholder="SAFE with 20% discount, Pro-rata rights, Board observer seat for lead investor..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Investment Round'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/my-projects`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
