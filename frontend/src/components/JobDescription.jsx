import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setSingleJob } from '@/redux/jobSlice';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import ResumeAnalysisModal from './ResumeAnalysisModal';
import { Brain } from 'lucide-react';

function JobDescription() {
    const params = useParams();
    const jobId = params.id;
    const { user } = useSelector(store => store.auth);
    const { singleJob } = useSelector(store => store.job);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const dispatch = useDispatch();


    useEffect(() => {
        const fetchSingleJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    console.log(res);
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJobs();
    }, [jobId, dispatch, user?._id]);


    const applyJobHandler = async () => {
        console.log(user)
        try {
            console.log(isApplied);
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
            console.log(res);

            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
            else {
                console.log(res.data.message);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error);
        }
    }

    const openAnalysisModal = () => {
        if (!user) {
            toast.error('Please login to analyze your resume');
            return;
        }
        if (!user.profile?.resumeOriginalName) {
            toast.error('Please upload your resume in your profile first');
            return;
        }
        setIsAnalysisModalOpen(true);
    };

    const closeAnalysisModal = () => {
        setIsAnalysisModalOpen(false);
    };

    return (
        <div className='max-w-7xl mx-auto my-10'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.postion} Positions</Badge>
                        <Badge className={'text-[#F83002] font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
                        <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary}LPA</Badge>
                    </div>
                </div>


                <div className='flex gap-3'>
                    <Button
                        onClick={openAnalysisModal}
                        className='rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex items-center gap-2 shadow-lg'
                    >
                        <Brain className='h-4 w-4' />
                        Analyze Resume
                    </Button>
                    
                    <Button
                        onClick={isApplied ? null : applyJobHandler}
                        disabled={isApplied}
                        className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad] cursor-pointer'}`}>
                        {isApplied ? 'Already Applied' : 'Apply Now'}
                    </Button>
                </div>
            </div>
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experience} yrs</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary}LPA</span></h1>
                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length}</span></h1>
                <h1 className='font-bold my-1'>
                    Posted Date:
                    <span className='pl-4 font-normal text-gray-800'>
                        {singleJob?.createdAt ? new Date(singleJob.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                </h1>

            </div>
            
            {/* Resume Analysis Modal */}
            <ResumeAnalysisModal 
                isOpen={isAnalysisModalOpen} 
                onClose={closeAnalysisModal} 
                jobId={jobId} 
            />
        </div>
    )
}

export default JobDescription