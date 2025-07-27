import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Brain, AlertCircle, Clock } from 'lucide-react';

const AnalysisResultModal = ({ isOpen, onClose, applicant }) => {
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Brain className="h-6 w-6 text-purple-600" />
                        Analysis Results - {applicant?.fullname}
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

                <div className="mt-4 space-y-6">
                    {/* Placeholder notice */}
                    <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Clock className="h-8 w-8 text-amber-600" />
                                <div>
                                    <h3 className="font-semibold text-amber-800">Feature Coming Soon</h3>
                                    <p className="text-sm text-amber-700">
                                        Resume analysis results will be displayed here once the candidate analyzes 
                                        their resume against job postings.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mock analysis data structure for future implementation */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Candidate Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-semibold">Name:</span> {applicant?.fullname}
                                </div>
                                <div>
                                    <span className="font-semibold">Email:</span> {applicant?.email}
                                </div>
                                <div>
                                    <span className="font-semibold">Phone:</span> {applicant?.phoneNumber}
                                </div>
                                <div>
                                    <span className="font-semibold">Resume:</span> 
                                    {applicant?.profile?.resumeOriginalName ? 
                                        <span className="text-green-600 ml-1">Available</span> :
                                        <span className="text-red-600 ml-1">Not Available</span>
                                    }
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Placeholder for future analysis sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-gray-200 bg-gray-50">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">ATS Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center h-24">
                                    <AlertCircle className="h-8 w-8 text-gray-400" />
                                    <span className="ml-2 text-gray-500">Pending Analysis</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 bg-gray-50">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">Skills Match</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center h-24">
                                    <AlertCircle className="h-8 w-8 text-gray-400" />
                                    <span className="ml-2 text-gray-500">Pending Analysis</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 bg-gray-50">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">Experience Level</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center h-24">
                                    <AlertCircle className="h-8 w-8 text-gray-400" />
                                    <span className="ml-2 text-gray-500">Pending Analysis</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 bg-gray-50">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">Overall Rating</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center h-24">
                                    <AlertCircle className="h-8 w-8 text-gray-400" />
                                    <span className="ml-2 text-gray-500">Pending Analysis</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Instructions for recruiters */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <h4 className="font-semibold text-blue-800 mb-2">How Analysis Works</h4>
                            <div className="text-sm text-blue-700 space-y-2">
                                <p>• Candidates can analyze their resume against your job postings</p>
                                <p>• Analysis includes ATS score, skills matching, and improvement suggestions</p>
                                <p>• Results will appear here once candidates perform the analysis</p>
                                <p>• You can use this data to better understand candidate fit</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button disabled className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed">
                            Generate Report (Coming Soon)
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AnalysisResultModal;
