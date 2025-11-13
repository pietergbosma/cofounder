import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentModal } from '../components/payment/PaymentModal';
import { useAuth } from '../contexts/AuthContext';
import { projectService, positionService } from '../services/api';

export const CreateProjectPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState({
    title: '',
    description: '',
    category: '',
    website: '',
  });

  const [positions, setPositions] = useState<Array<{
    title: string;
    description: string;
    requirements: string;
  }>>([]);

  const [currentPosition, setCurrentPosition] = useState({
    title: '',
    description: '',
    requirements: '',
  });

  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const PROJECT_POSTING_FEE = 50;

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

  const handleAddPosition = () => {
    if (currentPosition.title && currentPosition.description && currentPosition.requirements) {
      setPositions([...positions, currentPosition]);
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

    if (!user) {
      alert('You must be logged in');
      return;
    }

    if (!project.title || !project.description || !project.category) {
      alert('Please fill in all required project fields');
      return;
    }

    // Check if payment is completed
    if (!paymentCompleted) {
      setShowPaymentModal(true);
      return;
    }

    setSaving(true);

    try {
      // Create project
      const newProject = await projectService.createProject({
        owner_id: user.id,
        title: project.title,
        description: project.description,
        category: project.category,
        website: project.website,
      });

      // Create positions
      for (const position of positions) {
        await positionService.createPosition({
          project_id: newProject.id,
          title: position.title,
          description: position.description,
          requirements: position.requirements,
          status: 'open',
        });
      }

      alert('Project created successfully!');
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    setShowPaymentModal(false);
    // Automatically trigger project creation after payment
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
            <p className="text-gray-600">Share your project and find the perfect co-founders</p>
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
                        <h4 className="font-bold text-gray-900">{pos.title}</h4>
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
                <h3 className="font-medium text-gray-900">Add a Position</h3>
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

              {positions.length === 0 && (
                <p className="text-sm text-gray-600 mt-4">
                  Add at least one position to attract co-founders
                </p>
              )}
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating Project...' : paymentCompleted ? 'Create Project' : 'Continue to Payment'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/my-projects')}>
                Cancel
              </Button>
            </div>

            {!paymentCompleted && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💳 A one-time payment of <strong>${PROJECT_POSTING_FEE}</strong> is required to post your project
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        amount={PROJECT_POSTING_FEE}
      />
    </>
  );
};
