import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job'
import LoginPrompt from './ui/login-prompt'
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, Filter, Star } from 'lucide-react';

function Jobs() {
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {
        if (searchedQuery) {
            const filteredJobs = allJobs.filter((job) => {
                return job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.location.toLowerCase().includes(searchedQuery.toLowerCase());
            });
            setFilterJobs(filteredJobs);
        } else {
            setFilterJobs(allJobs);
        }
    }, [allJobs, searchedQuery])

    const jobsFeatures = [
        { icon: Search, text: "Advanced job search filters" },
        { icon: Filter, text: "AI-powered job matching" },
        { icon: Star, text: "Save and track applications" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <Navbar />
            {!user ? (
                <LoginPrompt 
                    title="Discover Your Next Opportunity"
                    description="Access thousands of job listings with advanced search and AI-powered matching. Login to unlock your career potential."
                    features={jobsFeatures}
                    className="py-16"
                />
            ) : (
                <div className='max-w-7xl mx-auto px-4 py-8'>
                    <div className='flex gap-6'>
                        <div className='w-1/4'>
                            <FilterCard />
                        </div>
                        <div className='flex-1'>
                            {
                                filterJobs.length <= 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <span className="text-2xl font-bold text-gray-400">📄</span>
                                        </div>
                                        <h2 className='text-2xl font-bold text-gray-700 mb-2'>No Jobs Found</h2>
                                        <p className="text-gray-500">Try adjusting your filters or search criteria</p>
                                    </div>
                                ) : (
                                    <div className='h-[85vh] overflow-y-auto pr-2'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                                            {filterJobs.map((job) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20 }} 
                                                    animate={{ opacity: 1, y: 0 }} 
                                                    exit={{ opacity: 0, y: -20 }} 
                                                    transition={{ duration: 0.3 }} 
                                                    key={job._id}
                                                >
                                                    <Job job={job} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Jobs
