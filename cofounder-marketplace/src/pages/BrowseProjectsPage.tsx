import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { positionService } from '../services/api';
import { Position } from '../types';
import { useNavigate } from 'react-router-dom';

export const BrowseProjectsPage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await positionService.getAllOpenPositions();
        setPositions(data);
        setFilteredPositions(data);
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  useEffect(() => {
    let filtered = positions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (pos) =>
          pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pos.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pos.project?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((pos) => pos.project?.category === selectedCategory);
    }

    setFilteredPositions(filtered);
  }, [searchTerm, selectedCategory, positions]);

  const categories = ['all', ...Array.from(new Set(positions.map((p) => p.project?.category).filter(Boolean)))];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading positions...</div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Open Positions</h1>
            <p className="text-gray-600">
              Discover exciting projects looking for co-founders like you
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search positions, projects, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter size={20} className="text-gray-600 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4">
            <p className="text-gray-600">
              {filteredPositions.length} position{filteredPositions.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Positions Grid */}
          {filteredPositions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPositions.map((position) => (
                <Card key={position.id} className="hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                      {position.project && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-blue-600">{position.project.title}</span>
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {position.project.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600">{position.description}</p>

                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                      <p className="text-sm text-gray-600">{position.requirements}</p>
                    </div>

                    {position.project?.owner && (
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                        <img
                          src={position.project.owner.avatar_url}
                          alt={position.project.owner.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {position.project.owner.name}
                          </p>
                          <p className="text-xs text-gray-500">Project Owner</p>
                        </div>
                      </div>
                    )}

                    <Button
                      fullWidth
                      onClick={() => navigate(`/projects/${position.project_id}`)}
                    >
                      View Details & Apply
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No positions found matching your criteria</p>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};
