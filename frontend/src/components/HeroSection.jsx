import { Search, Briefcase, Users, TrendingUp, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const searchJobHandler = () => {
        if (query.trim() === "") {
            toast.error("Please enter a search query")
            return
        };
        dispatch(setSearchedQuery(query));
        navigate('/browse')
    }

    const stats = [
        { icon: Briefcase, label: "Active Jobs", value: "1000+" },
        { icon: Users, label: "Job Seekers", value: "50K+" },
        { icon: TrendingUp, label: "Success Rate", value: "95%" },
    ];

    return (
        <div className='relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden'>
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
            </div>

            <div className='relative max-w-6xl mx-auto px-4 text-center'>
                <div className='flex flex-col items-center gap-8'>
                    {/* Badge */}
                    <div className='flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200/50 shadow-lg'>
                        <Sparkles className='w-5 h-5 text-blue-500' />
                        <span className='text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                            #1 AI-Powered Job Platform
                        </span>
                    </div>

                    {/* Main Heading */}
                    <div className='space-y-4'>
                        <h1 className='text-6xl md:text-7xl font-bold leading-tight'>
                            <span className='bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                                Find Your Dream Job with
                            </span>
                            <br />
                            <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                                Hirey Wirey
                            </span>
                        </h1>
                        <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
                            Where artificial intelligence meets opportunity. Get AI-powered resume analysis, 
                            personalized job recommendations, and career guidance all in one place.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="flex items-stretch bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    placeholder='Search jobs by title, company, or skills...' 
                                    className='w-full h-16 px-6 text-lg border-0 focus:outline-none focus:ring-0 bg-transparent placeholder-gray-500'
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && searchJobHandler()}
                                />
                            </div>
                            <button 
                                onClick={searchJobHandler} 
                                className='flex items-center justify-center h-16 px-8 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-r-2xl border-0 shadow-none hover:shadow-lg transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            >
                                <Search className='w-5 h-5 mr-2' />
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-12 w-full max-w-2xl">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center group">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-200 border border-gray-200/50 mb-3">
                                    <stat.icon className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection
