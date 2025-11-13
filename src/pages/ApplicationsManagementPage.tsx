import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ApplicationCard } from '../components/shared/ApplicationCard';
import { useAuth } from '../contexts/AuthContext';
import { projectService, applicationService } from '../services/api';
import { Project, Application } from '../types';

export const ApplicationsManagementPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        const [projectData, applicationsData] = await Promise.all([
          projectService.getProjectById(projectId),
          applicationService.getApplicationsByProject(projectId),
        ]);

        if (projectData?.owner_id !== user?.id) {
          alert('You do not have permission to view these applications');
          navigate('/my-projects');
          return;
        }

        setProject(projectData);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, user, navigate]);

  const handleAccept = async (applicationId: string) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, 'accepted');
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: 'accepted' } : app
        )
      );
      alert('Application accepted! The applicant has been added to your project team.');
    } catch (error) {
      console.error('Error accepting application:', error);
      alert('Failed to accept application');
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to reject this application?')) {
      return;
    }

    try {
      await applicationService.updateApplicationStatus(applicationId, 'rejected');
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: 'rejected' } : app
        )
      );
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    }
  };

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
            <Button variant="outline" onClick={() => navigate(`/projects/${projectId}`)}>
              Back to Project
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Applications for {project?.title}
            </h1>
            <p className="text-gray-600">Review and manage applications for your project</p>
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
                <ApplicationCard
                  key={application.id}
                  application={application}
                  showActions
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-600 text-center py-12">
                {filter === 'all'
                  ? 'No applications yet'
                  : `No ${filter} applications`}
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};
