import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Edit2, Eye, MoreHorizontal, MapPin, Calendar, DollarSign, Users, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();
    
    useEffect(() => {
        const filteredJob = allAdminJobs.length >= 0 && allAdminJobs.filter((job) => {
            if (!searchJobByText) {
                return true
            };
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
                   job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
                   job?.location?.toLowerCase().includes(searchJobByText.toLowerCase());
        });
        setFilterJobs(filteredJob);
    }, [allAdminJobs, searchJobByText])

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getStatusBadge = (job) => {
        const daysOld = Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
        if (daysOld <= 7) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">New</Badge>;
        } else if (daysOld <= 30) {
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>;
        } else {
            return <Badge variant="outline" className="text-gray-600">Older</Badge>;
        }
    };

    if (!filterJobs || filterJobs.length === 0) {
        return (
            <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                    {searchJobByText ? 
                        `No jobs match your search for "${searchJobByText}"` : 
                        "You haven't posted any jobs yet. Start by creating your first job posting."
                    }
                </p>
                {!searchJobByText && (
                    <Button
                        onClick={() => navigate('/admin/jobs/create')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                        Post Your First Job
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableCaption className="text-gray-600 py-4">
                    Showing {filterJobs.length} job{filterJobs.length !== 1 ? 's' : ''} • 
                    Total applications: {filterJobs.reduce((total, job) => total + (job.applications?.length || 0), 0)}
                </TableCaption>
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-900">Job Details</TableHead>
                        <TableHead className="font-semibold text-gray-900">Company</TableHead>
                        <TableHead className="font-semibold text-gray-900">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900">Applications</TableHead>
                        <TableHead className="font-semibold text-gray-900">Posted Date</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs?.map((job) => (
                            <TableRow 
                                key={job._id} 
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                            >
                                <TableCell className="py-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                {job.salary} LPA
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-gray-900">{job.company?.name}</p>
                                            <p className="text-sm text-gray-600">{job.jobType}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    {getStatusBadge(job)}
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {job.applications?.length || 0}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(job.createdAt)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right py-4" onClick={(e) => e.stopPropagation()}>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-2">
                                            <div className="space-y-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                                                    className='w-full justify-start gap-2'
                                                >
                                                    <Eye className='w-4 h-4' />
                                                    View Applicants
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/companies/${job.company._id}`)}
                                                    className='w-full justify-start gap-2'
                                                >
                                                    <Edit2 className='w-4 h-4' />
                                                    Edit Company
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable