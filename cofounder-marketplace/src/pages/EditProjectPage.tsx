import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { projectService, positionService } from '../services/api';
import { Project, Position } from '../types';

export const EditProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState({
    title: '',
    description: '',
    category: '',
    website: '',
  });

  const [positions, setPositions] = useState<Array<{
    id?: string;
    title: string;
    description: string;
    requirements: string;
    status?: string;
    isNew?: boolean;
  }>>([]);

  const [currentPosition, setCurrentPosition] = useState({
    title: '',
    description: '',
    requirements: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProject, setOriginalProject] = useState<Project | null>(null);

  const categories = [
    'Developer Tools',
    'Health & Fitness',
    'Education',
    'Marketing',
    'E-commerce',
    'FinTech',
    'Social Network',
    'Productivity',
    'Entertainment',
    'Other',
  ];

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        navigate('/my-projects');
        return;
      }

      try {
        const [projectData, positionsData] = await Promise.all([
          projectService.getProjectById(projectId),
          positionService.getPositionsByProject(projectId),
        ]);

        if (!projectData || projectData.owner_id !== user?.id) {
          alert('You do not have permission to edit this project');
          navigate('/my-projects');
          return;
        }

        setOriginalProject(projectData);
        setProject({
          title: projectData.title,
          description: projectData.description,
          category: projectData.category,
          website: projectData.website || '',
        });

        setPositions(positionsData.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          requirements: p.requirements,
          status: p.status,
          isNew: false,
        })));
      } catch (error) {
        console.error('Error fetching project:', error);
        alert('Failed to load project');
        navigate('/my-projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, user, navigate]);

  const handleAddPosition = () => {
    if (currentPosition.title && currentPosition.description && currentPosition.requirements) {
      setPositions([...positions, { ...currentPosition, isNew: true, status: 'open' }]);
      setCurrentPosition({ title: '', description: '', requirements: '' });
    } else {
      alert('Please fill in all position fields');
    }
  };

  const handleRemovePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !projectId || !originalProject) {
      alert('You must be logged in');
      return;
    }

    if (!project.title || !project.description || !project.category) {
      alert('Please fill in all required project fields');
      return;
    }

    setSaving(true);

    try {
      // Update project
      await projectService.updateProject(projectId, {
        title: project.title,
        description: project.description,
        category: project.category,
        website: project.website,
      });

      // Handle positions
      // Note: In mock mode, we're just creating new positions
      // In production with Supabase, you'd want to:
      // 1. Update existing positions that were modified
      // 2. Delete positions that were removed
      // 3. Create new positions
      
      const newPositions = positions.filter(p => p.isNew);
      for (const position of newPositions) {
        await positionService.createPosition({
          project_id: projectId,
          title: position.title,
          description: position.description,
          requirements: position.requirements,
          status: 'open',
        });
      }

      alert('Project updated successfully!');
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setSaving(false);
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Project</h1>
            <p className="text-gray-600">Update your project details and positions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Details */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => setProject({ ...project, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={project.description}
                    onChange={(e) => setProject({ ...project, description: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your project, its goals, and target market..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={project.category}
                    onChange={(e) => setProject({ ...project, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    value={project.website}
                    onChange={(e) => setProject({ ...project, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourproject.com"
                  />
                </div>
              </div>
            </Card>

            {/* Open Positions */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Open Positions</h2>
              
              {/* Added Positions */}
              {positions.length > 0 && (
                <div className="space-y-3 mb-6">
                  {positions.map((pos, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{pos.title}</h4>
                          {!pos.isNew && (
                            <span className="text-xs text-gray-500">(Existing position)</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePosition(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{pos.description}</p>
                      <p className="text-sm text-gray-500">Requirements: {pos.requirements}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Position Form */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Add a New Position</h3>
                <div>
                  <input
                    type="text"
                    value={currentPosition.title}
                    onChange={(e) => setCurrentPosition({ ...currentPosition, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Position title (e.g., Technical Co-Founder)"
                  />
                </div>
                <div>
                  <textarea
                    value={currentPosition.description}
                    onChange={(e) => setCurrentPosition({ ...currentPosition, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Position description and responsibilities..."
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={currentPosition.requirements}
                    onChange={(e) => setCurrentPosition({ ...currentPosition, requirements: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Requirements (e.g., 5+ years Python, ML experience)"
                  />
                </div>
                <Button type="button" onClick={handleAddPosition} variant="outline">
                  Add Position
                </Button>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                ℹ️ Note: Removing existing positions here only hides them from this view. In production, position management would be more sophisticated.
              </p>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/projects/${projectId}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
