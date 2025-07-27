import React, { useState } from 'react'
import { Button } from './ui/button'
import { Bookmark, Brain, MapPin, Calendar, DollarSign, Users } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ResumeAnalysisModal from './ResumeAnalysisModal'

function Job({ job }) {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    
    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentDate = new Date();
        const timeDifference = currentDate - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }
    
    const handleAnalyzeResume = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        if (user.role !== 'jobseeker') {
            alert('Resume analysis is only available for jobseekers');
            return;
        }
        
        setIsAnalysisModalOpen(true);
    }

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    }

    return (
        <div className='group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-blue-200'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
                <span className='px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full'>
                    {daysAgoFunction(job?.createdAt) === 0 ? "Posted Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                </span>
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleBookmark}
                    className={`rounded-full p-2 transition-colors ${
                        isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
            </div>

            {/* Company Info */}
            <div className='flex items-center gap-4 mb-4'>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {job?.company?.logo ? (
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={job?.company?.logo} alt={job?.company?.name} />
                        </Avatar>
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {job?.company?.name?.charAt(0) || 'C'}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className='font-semibold text-gray-900 text-lg'>{job?.company?.name}</h3>
                    <div className='flex items-center text-sm text-gray-500'>
                        <MapPin className='w-4 h-4 mr-1' />
                        {job?.location || 'Remote'}
                    </div>
                </div>
            </div>

            {/* Job Title & Description */}
            <div className='mb-4'>
                <h2 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
                    {job?.title}
                </h2>
                <p className='text-gray-600 text-sm leading-relaxed line-clamp-2'>
                    {job?.description}
                </p>
            </div>

            {/* Job Details */}
            <div className='flex flex-wrap gap-2 mb-6'>
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800">
                    <Users className="w-3 h-3" />
                    {job?.position} Positions
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800">
                    <Calendar className="w-3 h-3" />
                    {job?.jobType}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800">
                    <DollarSign className="w-3 h-3" />
                    {job?.salary} LPA
                </Badge>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-wrap gap-3'>
                <Button 
                    onClick={() => navigate(`/description/${job?._id}`)} 
                    variant="outline"
                    className="flex-1 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-semibold rounded-xl transition-all duration-200"
                >
                    View Details
                </Button>
                
                {user && user.role === 'jobseeker' && (
                    <Button 
                        onClick={handleAnalyzeResume}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                        <Brain className="mr-2 h-4 w-4" /> 
                        AI Analysis
                    </Button>
                )}
            </div>
            
            {/* Resume Analysis Modal */}
            {isAnalysisModalOpen && (
                <ResumeAnalysisModal 
                    isOpen={isAnalysisModalOpen} 
                    onClose={() => setIsAnalysisModalOpen(false)} 
                    jobId={job?._id}
                />
            )}
        </div>
    )
}

export default Job
