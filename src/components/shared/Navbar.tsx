import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, LogOut, User, Briefcase, FileText, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isInvestor = user.user_type === 'investor';

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to={isInvestor ? "/investor-dashboard" : "/dashboard"} 
            className="flex items-center gap-2 text-xl font-bold text-blue-600"
          >
            <Users size={28} />
            <span>CoFounder Hub</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {/* Investor Navigation */}
            {isInvestor ? (
              <>
                <Link
                  to="/investor-dashboard"
                  className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <TrendingUp size={18} />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/investment-opportunities"
                  className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <Briefcase size={18} />
                  <span>Opportunities</span>
                </Link>
                
                <Link
                  to="/investor-portfolio"
                  className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <Wallet size={18} />
                  <span>Portfolio</span>
                </Link>
                
                <Link
                  to="/browse"
                  className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <FileText size={18} />
                  <span>Projects</span>
                </Link>
              </>
            ) : (
              /* Founder Navigation */
              <>
                <Link
                  to="/browse"
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Briefcase size={18} />
                  <span>Browse Projects</span>
                </Link>
                
                <Link
                  to="/my-projects"
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <FileText size={18} />
                  <span>My Projects</span>
                </Link>
                
                <Link
                  to="/mrr-dashboard"
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <DollarSign size={18} />
                  <span>MRR</span>
                </Link>
              </>
            )}
            
            <Link
              to="/profile"
              className={`flex items-center gap-1 transition-colors ${
                isInvestor ? 'text-gray-700 hover:text-green-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
