import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/shared/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProjectCard } from '../components/shared/ProjectCard';
import { ApplicationCard } from '../components/shared/ApplicationCard';
import {
  projectService,
  applicationService,
  projectMemberService,
  mrrService,
} from '../services/api';
import { Project, Application, ProjectMember, MRRData } from '../types';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [myMemberships, setMyMemberships] = useState<ProjectMember[]>([]);
  const [totalMRR, setTotalMRR] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [projects, applications, memberships, mrrData] = await Promise.all([
          projectService.getProjectsByOwner(user.id),
          applicationService.getApplicationsByApplicant(user.id),
          projectMemberService.getMembersByUser(user.id),
          mrrService.getMRRByUser(user.id),
        ]);

        setMyProjects(projects);
        setMyApplications(applications);
        setMyMemberships(memberships);

        // Calculate total MRR
        const total = mrrData.reduce((sum, project) => {
          const latestMRR = project.data[project.data.length - 1]?.revenue || 0;
          return sum + latestMRR;
        }, 0);
        setTotalMRR(total);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </>
    );
  }

  const pendingApplications = myApplications.filter(app => app.status === 'pending');
  const acceptedApplications = myApplications.filter(app => app.status === 'accepted');

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your projects and applications.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Briefcase className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">My Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{myProjects.length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Collaborations</p>
                  <p className="text-2xl font-bold text-gray-900">{myMemberships.length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileText className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Apps</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingApplications.length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total MRR</p>
                  <p className="text-2xl font-bold text-gray-900">${totalMRR.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/browse')}>Browse Projects</Button>
              <Button variant="outline" onClick={() => navigate('/my-projects/new')}>
                Create New Project
              </Button>
              <Button variant="outline" onClick={() => navigate('/mrr-dashboard')}>
                View MRR Dashboard
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Projects */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Projects</h2>
              {myProjects.length > 0 ? (
                <div className="space-y-4">
                  {myProjects.slice(0, 3).map(project => (
                    <ProjectCard key={project.id} project={project} showOwner={false} />
                  ))}
                  {myProjects.length > 3 && (
                    <Button variant="outline" fullWidth onClick={() => navigate('/my-projects')}>
                      View All Projects
                    </Button>
                  )}
                </div>
              ) : (
                <Card>
                  <p className="text-gray-600 text-center py-8">
                    You haven't created any projects yet.
                  </p>
                  <Button fullWidth onClick={() => navigate('/my-projects/new')}>
                    Create Your First Project
                  </Button>
                </Card>
              )}
            </div>

            {/* Recent Applications */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h2>
              {myApplications.length > 0 ? (
                <div className="space-y-4">
                  {myApplications.slice(0, 3).map(application => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
                  {myApplications.length > 3 && (
                    <Button variant="outline" fullWidth onClick={() => navigate('/my-applications')}>
                      View All Applications
                    </Button>
                  )}
                </div>
              ) : (
                <Card>
                  <p className="text-gray-600 text-center py-8">
                    You haven't applied to any positions yet.
                  </p>
                  <Button fullWidth onClick={() => navigate('/browse')}>
                    Browse Open Positions
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
