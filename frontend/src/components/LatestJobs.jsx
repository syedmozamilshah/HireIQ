import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';
import { TrendingUp, Briefcase } from 'lucide-react';

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);
    return (
        <div className='max-w-7xl mx-auto px-4 py-16'>
            {/* Section Header */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                    <h1 className='text-4xl font-bold text-gray-900'>
                        Latest & Top <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>Job Openings</span>
                    </h1>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Discover the most recent opportunities from top companies. Find your perfect match today!
                </p>
            </div>

            {/* Jobs Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {
                    allJobs.length <= 0 ? (
                        <div className="col-span-full text-center py-12">
                            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <span className='text-xl text-gray-500'>No Jobs Available</span>
                            <p className="text-gray-400 mt-2">Check back soon for new opportunities!</p>
                        </div>
                    ) : (
                        allJobs?.slice(0, 6).map((job) => <LatestJobCards key={job._id} job={job} />)
                    )
                }
            </div>
        </div>
    )
}

export default LatestJobs