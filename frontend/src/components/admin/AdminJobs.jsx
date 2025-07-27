import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'
import { Plus, Search, Briefcase, Filter, BarChart3, ArrowLeft } from 'lucide-react'

const AdminJobs = () => {
    useGetAllAdminJobs();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { allAdminJobs } = useSelector(store => store.job);

    useEffect(() => {
        dispatch(setSearchJobByText(input));
    }, [input]);

    const totalJobs = allAdminJobs?.length || 0;
    const activeJobs = allAdminJobs?.filter(job => new Date(job.createdAt) > new Date(Date.now() - 30*24*60*60*1000))?.length || 0;
    const totalApplications = allAdminJobs?.reduce((total, job) => total + (job.applications?.length || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 py-8'>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Dashboard
                        </Button>
                        <div className="flex-1">
                            <h1 className='text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                                <Briefcase className="w-8 h-8 text-blue-600" />
                                Job Management
                            </h1>
                            <p className="text-gray-600">Manage all your job postings and track their performance</p>
                        </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 mb-1">Total Jobs</p>
                                    <h3 className="text-2xl font-bold text-blue-900">{totalJobs}</h3>
                                </div>
                                <div className="p-3 bg-blue-200 rounded-lg">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 mb-1">Active Jobs</p>
                                    <h3 className="text-2xl font-bold text-green-900">{activeJobs}</h3>
                                </div>
                                <div className="p-3 bg-green-200 rounded-lg">
                                    <BarChart3 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 mb-1">Applications</p>
                                    <h3 className="text-2xl font-bold text-purple-900">{totalApplications}</h3>
                                </div>
                                <div className="p-3 bg-purple-200 rounded-lg">
                                    <Filter className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Search and Actions */}
                <Card className="p-6 mb-6 border-0 shadow-sm">
                    <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Search jobs by title, company, or location..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="px-3 py-1">
                                {totalJobs} jobs found
                            </Badge>
                            <Button 
                                onClick={() => navigate("/admin/jobs/create")}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Post New Job
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Jobs Table */}
                <Card className="border-0 shadow-sm overflow-hidden">
                    <AdminJobsTable />
                </Card>
            </div>
        </div>
    )
}

export default AdminJobs