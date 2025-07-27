import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Building,
  Briefcase,
  Users,
  TrendingUp,
  Plus,
  Calendar,
  BarChart3,
  Clock,
  MapPin,
  DollarSign,
  Eye,
  UserCheck,
  ChevronRight,
  Star,
  Activity,
  Brain,
  Zap
} from 'lucide-react';
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs';
import useGetAllCompanies from '@/hooks/useGetAllCompanies';
import TopCandidatesModal from './TopCandidatesModal';
import { analyzeCandidates } from '@/services/langGraphAgent';

const RecruiterDashboard = () => {
  useGetAllAdminJobs();
  useGetAllCompanies();
  
  const navigate = useNavigate();
  const { allAdminJobs } = useSelector(store => store.job);
  const { companies } = useSelector(store => store.company);
  const { user } = useSelector(store => store.auth);
  
  // State for top candidates modal
  const [showTopCandidatesModal, setShowTopCandidatesModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Calculate statistics
  const totalJobs = allAdminJobs?.length || 0;
  const totalCompanies = companies?.length || 0;
  const activeJobs = allAdminJobs?.filter(job => new Date(job.createdAt) > new Date(Date.now() - 30*24*60*60*1000))?.length || 0;
  const totalApplications = allAdminJobs?.reduce((total, job) => total + (job.applications?.length || 0), 0) || 0;

  // Get recent jobs (last 5)
  const recentJobs = allAdminJobs?.slice(0, 5) || [];
  
  // Handle analyze top candidates
  const handleAnalyzeTopCandidates = async (job) => {
    try {
      setSelectedJob(job);
      setShowTopCandidatesModal(true);
    } catch (error) {
      console.error('Error analyzing candidates:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "blue" }) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span className={`text-sm font-medium flex items-center gap-1 ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-100 to-${color}-200`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color = "blue" }) => (
    <Card 
      className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50 group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-100 to-${color}-200 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </Card>
  );

  const RecentJobCard = ({ job }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-semibold text-gray-900">{job.title}</h4>
          <Badge variant="outline" className="text-xs">
            {job.company?.name}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {job.salary} LPA
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {job.applications?.length || 0}
        </Badge>
        {job.applications?.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAnalyzeTopCandidates(job)}
            className="text-xs border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
          >
            <Brain className="w-3 h-3 mr-1" />
            Analyze
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
          className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.fullname?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your recruitment activities today.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Button
                onClick={() => navigate('/admin/companies/create')}
                variant="outline"
                className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              >
                <Building className="w-4 h-4" />
                Add Company
              </Button>
              <Button
                onClick={() => navigate('/admin/jobs/create')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Post New Job
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Briefcase}
            title="Total Jobs"
            value={totalJobs}
            subtitle="All time"
            trend={12}
            color="blue"
          />
          <StatCard
            icon={Building}
            title="Companies"
            value={totalCompanies}
            subtitle="Registered"
            trend={8}
            color="green"
          />
          <StatCard
            icon={Activity}
            title="Active Jobs"
            value={activeJobs}
            subtitle="Last 30 days"
            trend={5}
            color="purple"
          />
          <StatCard
            icon={Users}
            title="Total Applications"
            value={totalApplications}
            subtitle="All jobs"
            trend={15}
            color="orange"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </h2>
              <div className="space-y-4">
                <QuickActionCard
                  icon={Plus}
                  title="Post New Job"
                  description="Create and publish a new job posting"
                  onClick={() => navigate('/admin/jobs/create')}
                  color="blue"
                />
                <QuickActionCard
                  icon={Building}
                  title="Add Company"
                  description="Register a new company profile"
                  onClick={() => navigate('/admin/companies/create')}
                  color="green"
                />
                <QuickActionCard
                  icon={BarChart3}
                  title="View Analytics"
                  description="Check job performance and metrics"
                  onClick={() => navigate('/admin/jobs')}
                  color="purple"
                />
                <QuickActionCard
                  icon={Users}
                  title="Manage Companies"
                  description="Edit company information and settings"
                  onClick={() => navigate('/admin/companies')}
                  color="orange"
                />
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Job Posts
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/jobs')}
                  className="flex items-center gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                >
                  View All
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <RecentJobCard key={job._id} job={job} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-600 mb-6">Start by posting your first job to attract candidates.</p>
                    <Button
                      onClick={() => navigate('/admin/jobs/create')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="md:hidden mt-6 grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate('/admin/companies/create')}
            variant="outline"
            className="flex items-center gap-2 justify-center py-3 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
          >
            <Building className="w-4 h-4" />
            Add Company
          </Button>
          <Button
            onClick={() => navigate('/admin/jobs/create')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2 justify-center py-3"
          >
            <Plus className="w-4 h-4" />
            Post Job
          </Button>
        </div>
      </div>
      
      {/* Top Candidates Modal */}
      <TopCandidatesModal
        isOpen={showTopCandidatesModal}
        onClose={() => setShowTopCandidatesModal(false)}
        job={selectedJob}
      />
    </div>
  );
};

export default RecruiterDashboard;
