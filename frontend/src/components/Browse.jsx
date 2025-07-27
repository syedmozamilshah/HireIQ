import React, { useEffect } from 'react'
import Navbar from './shared/Navbar';
import Job from './Job';
import LoginPrompt from './ui/login-prompt';
import { useDispatch, useSelector } from 'react-redux';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { setSearchedQuery } from '@/redux/jobSlice';
import { Search, Filter, MapPin, Briefcase, Compass, Globe } from 'lucide-react';

function Browse() {
    useGetAllJobs();
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch()
    
    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(''))
        }
    })
    
    const browseFeatures = [
        { icon: Compass, text: "Explore opportunities by category" },
        { icon: Globe, text: "Browse jobs worldwide" },
        { icon: Search, text: "Find your perfect match" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <Navbar />
            {!user ? (
                <LoginPrompt 
                    title="Explore Career Opportunities"
                    description="Browse through thousands of job opportunities from top companies. Get started by creating your account."
                    features={browseFeatures}
                    className="py-16"
                />
            ) : (
                <div className='max-w-7xl mx-auto px-4 py-8'>
                {/* Header Section */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                            {searchedQuery ? `Search Results for "${searchedQuery}"` : 'Browse Jobs'}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Found {allJobs.length} opportunities waiting for you
                        </p>
                    </div>
                    
                    {/* Stats Bar */}
                    <div className="flex justify-center items-center gap-8 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">{allJobs.length} Jobs</span>
                        </div>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-5 h-5 text-green-500" />
                            <span className="font-semibold">All Locations</span>
                        </div>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Search className="w-5 h-5 text-purple-500" />
                            <span className="font-semibold">Live Results</span>
                        </div>
                    </div>
                </div>

                {/* Jobs Grid */}
                <div className="relative">
                    {allJobs.length <= 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 className='text-2xl font-bold text-gray-700 mb-2'>No Jobs Found</h2>
                            <p className="text-gray-500 text-lg">Try adjusting your search criteria or browse all jobs</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allJobs.map((job) => (
                                <Job key={job._id} job={job} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Load More Section */}
                {allJobs.length > 0 && (
                    <div className="text-center mt-12">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20 text-gray-600">
                            <span className="font-medium">Showing all {allJobs.length} results</span>
                        </div>
                    </div>
                )}
                </div>
            )}
        </div>
    )
}

export default Browse
