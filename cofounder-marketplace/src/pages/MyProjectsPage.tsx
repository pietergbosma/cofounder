import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProjectCard } from '../components/shared/ProjectCard';
import { useAuth } from '../contexts/AuthContext';
import { projectService, projectMemberService } from '../services/api';
import { Project, ProjectMember } from '../types';

export const MyProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [memberships, setMemberships] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        const [owned, member] = await Promise.all([
          projectService.getProjectsByOwner(user.id),
          projectMemberService.getMembersByUser(user.id),
        ]);

        setOwnedProjects(owned);
        setMemberships(member.filter(m => m.project?.owner_id !== user.id)); // Exclude owned projects
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading projects...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
              <p className="text-gray-600">Manage your projects and collaborations</p>
            </div>
            <Button onClick={() => navigate('/my-projects/new')}>
              <Plus size={20} className="mr-2" />
              Create Project
            </Button>
          </div>

          {/* Owned Projects */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Projects I Own ({ownedProjects.length})
            </h2>
            {ownedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ownedProjects.map((project) => (
                  <div key={project.id} className="relative">
                    <ProjectCard project={project} showOwner={false} />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/my-projects/${project.id}/applications`);
                        }}
                      >
                        Applications
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">You haven't created any projects yet</p>
                  <Button onClick={() => navigate('/my-projects/new')}>
                    Create Your First Project
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Projects as Member */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Collaborating On ({memberships.length})
            </h2>
            {memberships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {memberships.map((membership) => (
                  <div key={membership.id}>
                    {membership.project && (
                      <Card hoverable onClick={() => navigate(`/projects/${membership.project_id}`)}>
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{membership.project.title}</h3>
                            <p className="text-sm text-blue-600 font-medium mt-1">Role: {membership.role}</p>
                          </div>
                          <p className="text-gray-600 line-clamp-2">{membership.project.description}</p>
                        </div>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">You're not collaborating on any projects yet</p>
                  <Button variant="outline" onClick={() => navigate('/browse')}>
                    Browse Open Positions
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
