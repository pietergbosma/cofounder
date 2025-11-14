import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ApplicationCard } from '../components/shared/ApplicationCard';
import { useAuth } from '../contexts/AuthContext';
import { applicationService } from '../services/api';
import { Application } from '../types';
import { useNavigate } from 'react-router-dom';

export const MyApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        const data = await applicationService.getApplicationsByApplicant(user.id);
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading applications...</div>
        </div>
      </>
    );
  }

  const filteredApplications =
    filter === 'all'
      ? applications
      : applications.filter((app) => app.status === filter);

  const pendingCount = applications.filter((app) => app.status === 'pending').length;
  const acceptedCount = applications.filter((app) => app.status === 'accepted').length;
  const rejectedCount = applications.filter((app) => app.status === 'rejected').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600">Track the status of your position applications</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{acceptedCount}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({applications.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              variant={filter === 'accepted' ? 'primary' : 'outline'}
              onClick={() => setFilter('accepted')}
            >
              Accepted ({acceptedCount})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'primary' : 'outline'}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({rejectedCount})
            </Button>
          </div>

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't applied to any positions yet</p>
                <Button onClick={() => navigate('/browse')}>
                  Browse Open Positions
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-gray-600 text-center py-12">
                No {filter} applications
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};
