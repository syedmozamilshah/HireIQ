import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router'
import { MapPin, Calendar, DollarSign, Users, ArrowRight } from 'lucide-react'

function LatestJobCards({ job }) {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/description/${job._id}`)} className='group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-blue-200'>
            {/* Company Header */}
            <div className='mb-4'>
                <div className="flex items-center justify-between mb-2">
                    <h1 className='font-semibold text-lg text-gray-900'>{job?.company?.name}</h1>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className='flex items-center text-sm text-gray-500'>
                    <MapPin className='w-4 h-4 mr-1' />
                    {job?.location || 'Pakistan'}
                </div>
            </div>
            
            {/* Job Details */}
            <div className='mb-4'>
                <h2 className='font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
                    {job?.title}
                </h2>
                <p className='text-sm text-gray-600 leading-relaxed line-clamp-2'>
                    {job?.description}
                </p>
            </div>
            
            {/* Badges */}
            <div className='flex flex-wrap gap-2'>
                <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors'>
                    <Users className='w-3 h-3 mr-1' />
                    {job?.position} Positions
                </Badge>
                <Badge className='bg-green-100 text-green-800 hover:bg-green-200 transition-colors'>
                    <Calendar className='w-3 h-3 mr-1' />
                    {job?.jobType}
                </Badge>
                <Badge className='bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors'>
                    <DollarSign className='w-3 h-3 mr-1' />
                    {job?.salary} LPA
                </Badge>
            </div>
        </div>
    )
}

export default LatestJobCards
