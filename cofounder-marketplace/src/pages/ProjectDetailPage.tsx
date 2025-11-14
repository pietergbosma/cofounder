import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, Users, Calendar } from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  projectService,
  positionService,
  projectMemberService,
  applicationService,
  investmentRoundService,
} from '../services/api';
import { Project, Position, ProjectMember, InvestmentRound } from '../types';
import { format } from 'date-fns';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [investmentRounds, setInvestmentRounds] = useState<InvestmentRound[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const isOwner = project?.owner_id === user?.id;

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      try {
        const [projectData, positionsData, membersData, roundsData] = await Promise.all([
          projectService.getProjectById(projectId),
          positionService.getPositionsByProject(projectId),
          projectMemberService.getMembersByProject(projectId),
          investmentRoundService.getInvestmentRounds(projectId),
        ]);

        setProject(projectData);
        setPositions(positionsData);
        setMembers(membersData);
        setInvestmentRounds(roundsData);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleApply = async (positionId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!applicationMessage.trim()) {
      alert('Please write a cover letter');
      return;
    }

    setApplying(true);
    try {
      await applicationService.createApplication({
        position_id: positionId,
        applicant_id: user.id,
        message: applicationMessage,
      });

      alert('Application submitted successfully!');
      setSelectedPosition(null);
      setApplicationMessage('');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading project...</div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <p className="text-center text-gray-600 py-8">Project not found</p>
            <Button onClick={() => navigate('/browse')}>Browse Projects</Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Project Header */}
          <Card className="mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                    {project.category}
                  </span>
                </div>
                {isOwner && (
                  <Button variant="outline" onClick={() => navigate(`/my-projects/${project.id}/edit`)}>
                    Edit Project
                  </Button>
                )}
              </div>

              <p className="text-gray-600 text-lg">{project.description}</p>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={18} />
                    <span>Visit Website</span>
                  </a>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={18} />
                  <span>{members.length} team member{members.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <span>Created {format(new Date(project.created_at), 'MMM yyyy')}</span>
                </div>
              </div>

              {project.owner && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <img
                    src={project.owner.avatar_url}
                    alt={project.owner.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{project.owner.name}</p>
                    <p className="text-sm text-gray-600">Project Owner</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/profile/${project.owner_id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Open Positions */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Open Positions ({positions.filter(p => p.status === 'open').length})
                </h2>
                {positions.filter(p => p.status === 'open').length > 0 ? (
                  <div className="space-y-4">
                    {positions
                      .filter(p => p.status === 'open')
                      .map((position) => (
                        <Card key={position.id}>
                          <div className="space-y-3">
                            <h3 className="text-xl font-bold text-gray-900">{position.title}</h3>
                            <p className="text-gray-600">{position.description}</p>
                            
                            <div className="bg-gray-50 rounded p-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                              <p className="text-sm text-gray-600">{position.requirements}</p>
                            </div>

                            {!isOwner && (
                              <>
                                {selectedPosition === position.id ? (
                                  <div className="space-y-3 pt-3 border-t border-gray-200">
                                    <textarea
                                      value={applicationMessage}
                                      onChange={(e) => setApplicationMessage(e.target.value)}
                                      placeholder="Write a cover letter explaining why you're a great fit for this role..."
                                      rows={5}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleApply(position.id)}
                                        disabled={applying}
                                      >
                                        {applying ? 'Submitting...' : 'Submit Application'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedPosition(null);
                                          setApplicationMessage('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button onClick={() => setSelectedPosition(position.id)}>
                                    Apply for this Position
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card>
                    <p className="text-gray-600 text-center py-8">No open positions at the moment</p>
                  </Card>
                )}
              </div>

              {/* Investment Rounds */}
              {investmentRounds.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Investment Rounds ({investmentRounds.length})
                  </h2>
                  <div className="space-y-4">
                    {investmentRounds.map((round) => (
                      <Card key={round.id}>
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{round.round_name}</h3>
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                                round.status === 'open' 
                                  ? 'bg-green-100 text-green-800' 
                                  : round.status === 'closed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                ${(round.amount_seeking / 1000).toFixed(0)}K
                              </p>
                              <p className="text-sm text-gray-600">Seeking</p>
                            </div>
                          </div>
                          
                          <p className="text-gray-600">{round.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-sm text-gray-600">Valuation</p>
                              <p className="font-medium text-gray-900">
                                ${(round.valuation / 1000000).toFixed(1)}M
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Min Investment</p>
                              <p className="font-medium text-gray-900">
                                ${(round.min_investment / 1000).toFixed(0)}K
                              </p>
                            </div>
                          </div>

                          {round.status === 'open' && !isOwner && (
                            <Button 
                              onClick={() => navigate(`/investment-opportunities/${round.id}`)}
                              className="mt-2"
                            >
                              View Investment Details
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Team Members */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Team Members</h2>
              <div className="space-y-3">
                {members.map((member) => (
                  <Card key={member.id}>
                    <div className="flex items-center gap-3">
                      {member.user && (
                        <>
                          <img
                            src={member.user.avatar_url}
                            alt={member.user.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{member.user.name}</p>
                            <p className="text-sm text-gray-600 truncate">{member.role}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {isOwner && (
                <>
                  <Button
                    fullWidth
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate(`/my-projects/${project.id}/applications`)}
                  >
                    Manage Applications
                  </Button>
                  <Button
                    fullWidth
                    className="mt-3"
                    onClick={() => navigate(`/my-projects/${project.id}/create-round`)}
                  >
                    Create Investment Round
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
