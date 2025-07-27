import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { MoreHorizontal, FileText, Brain, Eye } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import ResumeViewModal from './ResumeViewModal';
import AnalysisResultModal from './AnalysisResultModal';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

    const statusHandler = async (status, id) => {
        console.log('changing status');
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            console.log(res);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <div>
            <Table>
                <TableCaption>A list of your recent applied user</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>FullName</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants && applicants?.applications?.map((item) => (
                            <tr key={item._id}>
                                <TableCell>{item?.applicant?.fullname}</TableCell>
                                <TableCell>{item?.applicant?.email}</TableCell>
                                <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {item.applicant?.profile?.resumeBase64 ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedApplicant(item.applicant);
                                                        setIsResumeModalOpen(true);
                                                    }}
                                                >
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    View Resume
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedApplicant(item.applicant);
                                                        setIsAnalysisModalOpen(true);
                                                    }}
                                                >
                                                    <Brain className="h-4 w-4 mr-1" />
                                                    View Analysis
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-gray-500">No Resume</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
                                <TableCell className="float-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <MoreHorizontal />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            {
                                                shortlistingStatus.map((status, index) => {
                                                    return (
                                                        <div onClick={() => statusHandler(status, item?._id)} key={index} className='flex w-fit items-center my-2 cursor-pointer'>
                                                            <span>{status}</span>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </PopoverContent>
                                    </Popover>

                                </TableCell>

                            </tr>
                        ))
                    }

                </TableBody>

            </Table>
            
            {/* Resume View Modal */}
            {isResumeModalOpen && selectedApplicant && (
                <ResumeViewModal 
                    isOpen={isResumeModalOpen}
                    onClose={() => {
                        setIsResumeModalOpen(false);
                        setSelectedApplicant(null);
                    }}
                    applicant={selectedApplicant}
                />
            )}
            
            {/* Analysis Result Modal */}
            {isAnalysisModalOpen && selectedApplicant && (
                <AnalysisResultModal 
                    isOpen={isAnalysisModalOpen}
                    onClose={() => {
                        setIsAnalysisModalOpen(false);
                        setSelectedApplicant(null);
                    }}
                    applicant={selectedApplicant}
                />
            )}
        </div>
    )
}

export default ApplicantsTable