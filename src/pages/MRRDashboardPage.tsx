import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { MRRChart } from '../components/shared/MRRChart';
import { useAuth } from '../contexts/AuthContext';
import { mrrService, projectMemberService } from '../services/api';
import { TrendingUp, DollarSign } from 'lucide-react';

export const MRRDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projectMRRData, setProjectMRRData] = useState<
    { projectId: string; projectTitle: string; data: any[] }[]
  >([]);
  const [totalMRR, setTotalMRR] = useState(0);
  const [totalGrowth, setTotalGrowth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMRRData = async () => {
      if (!user) return;

      try {
        const mrrData = await mrrService.getMRRByUser(user.id);
        setProjectMRRData(mrrData);

        // Calculate totals
        let currentTotal = 0;
        let previousTotal = 0;

        mrrData.forEach((project) => {
          if (project.data.length > 0) {
            const latest = project.data[project.data.length - 1];
            currentTotal += latest.revenue;

            if (project.data.length > 1) {
              const previous = project.data[project.data.length - 2];
              previousTotal += previous.revenue;
            }
          }
        });

        setTotalMRR(currentTotal);
        if (previousTotal > 0) {
          setTotalGrowth(((currentTotal - previousTotal) / previousTotal) * 100);
        }
      } catch (error) {
        console.error('Error fetching MRR data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMRRData();
  }, [user]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading MRR data...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MRR Dashboard</h1>
            <p className="text-gray-600">Track monthly recurring revenue across all your projects</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total MRR</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${totalMRR.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${totalGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <TrendingUp className={totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'} size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Growth</p>
                  <p className={`text-3xl font-bold ${totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGrowth >= 0 ? '+' : ''}{totalGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="text-blue-600" size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{projectMRRData.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Note about Stripe Integration */}
          <Card className="mb-8 bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Stripe Integration</h3>
                <p className="text-sm text-blue-800 mb-2">
                  This dashboard currently displays mock data. To track real MRR:
                </p>
                <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                  <li>Set up a Stripe account and get your API keys</li>
                  <li>Create a Supabase edge function to handle Stripe webhooks</li>
                  <li>Configure webhook events for subscription updates (customer.subscription.created, updated, deleted)</li>
                  <li>The edge function will automatically sync MRR data to your database</li>
                </ol>
                <p className="text-sm text-blue-700 mt-2 font-medium">
                  See the README for detailed integration instructions.
                </p>
              </div>
            </div>
          </Card>

          {/* Project-specific MRR Charts */}
          {projectMRRData.length > 0 ? (
            <div className="space-y-8">
              {projectMRRData.map((project) => (
                <MRRChart
                  key={project.projectId}
                  data={project.data}
                  title={project.projectTitle}
                />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No MRR data available yet</p>
                <p className="text-sm text-gray-500">
                  MRR data will appear once you integrate Stripe and have active subscriptions
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};
