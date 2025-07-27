import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Download, X, Loader2, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ResumeViewModal = ({ isOpen, onClose, applicant }) => {
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && applicant) {
            fetchResume();
        }
    }, [isOpen, applicant]);

    const fetchResume = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // If resume is already in applicant profile, use it directly
            if (applicant.profile?.resumeBase64) {
                setResumeData({
                    fileName: applicant.profile.resumeOriginalName || 'resume.pdf',
                    data: applicant.profile.resumeBase64
                });
            } else {
                // Otherwise fetch from API
                const response = await axios.get(
                    `http://localhost:3000/api/v1/resume/${applicant._id}`,
                    { withCredentials: true }
                );

                if (response.data.success) {
                    setResumeData(response.data.resume);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch resume');
                }
            }
        } catch (error) {
            console.error('Resume fetch error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to fetch resume');
            toast.error('Failed to load resume');
        } finally {
            setLoading(false);
        }
    };

    const downloadResume = () => {
        if (!resumeData) return;

        try {
            // Convert base64 to blob
            const byteCharacters = atob(resumeData.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = resumeData.fileName || `${applicant.fullname}_resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Resume downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download resume');
        }
    };

    const viewResumeInNewTab = () => {
        if (!resumeData) return;

        try {
            // Convert base64 to blob
            const byteCharacters = atob(resumeData.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // Open in new tab
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            // Clean up after a delay
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('View error:', error);
            toast.error('Failed to open resume');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {applicant?.fullname}'s Resume
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-4 top-4"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>

                <div className="mt-4">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="ml-2 text-lg">Loading resume...</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <FileText className="h-12 w-12 text-red-400 mx-auto mb-2" />
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button 
                                variant="outline" 
                                onClick={fetchResume}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {resumeData && !loading && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-8 w-8 text-blue-500" />
                                        <div>
                                            <h3 className="font-semibold">{resumeData.fileName}</h3>
                                            <p className="text-sm text-gray-600">
                                                Candidate: {applicant?.fullname}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Email: {applicant?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button 
                                    onClick={viewResumeInNewTab}
                                    className="bg-blue-600 text-white"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Resume
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={downloadResume}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </Button>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Resume Preview</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Click "View Resume" to open the full PDF in a new tab, or use "Download PDF" to save it locally.
                                </p>
                                
                                {/* PDF preview iframe - if browser supports it */}
                                <div className="w-full h-96 border rounded-lg overflow-hidden">
                                    <iframe
                                        src={`data:application/pdf;base64,${resumeData.data}`}
                                        className="w-full h-full"
                                        title="Resume Preview"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ResumeViewModal;
