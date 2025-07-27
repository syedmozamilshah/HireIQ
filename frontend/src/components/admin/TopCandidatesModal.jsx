import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { analyzeCandidates, getDetailedCandidateAnalysis } from '@/services/langGraphAgent';
import ResumeViewModal from './ResumeViewModal';
import { Star, Award, User, Mail, Phone, Eye, Download, TrendingUp, CheckCircle, AlertCircle, Brain, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopCandidatesModal = ({ isOpen, onClose, job, initialCandidates = [] }) => {
    const [topCandidates, setTopCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const { user } = useSelector((store) => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && job && job.applications?.length > 0) {
            analyzeJobCandidates();
        }
    }, [isOpen, job]);

    const analyzeJobCandidates = async () => {
        if (!job?.applications?.length) {
            setTopCandidates([]);
            return;
        }

        setLoading(true);
        try {
            const response = await analyzeCandidates(job, job.applications);
            if (response.success) {
                setTopCandidates(response.data);
            } else {
                toast.error('Failed to analyze candidates');
            }
        } catch (error) {
            console.error('Error analyzing candidates:', error);
            toast.error('Error analyzing candidates');
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewResume = (candidate) => {
        setSelectedCandidate(candidate);
        setShowResumeModal(true);
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 80) return 'text-blue-600 bg-blue-100';
        if (score >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const CandidateCard = ({ candidate, index }) => (
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-bold">
                            #{index + 1}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                {candidate.name}
                                {index === 0 && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {candidate.email}
                                </span>
                                {candidate.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {candidate.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {candidate.ats_score && (
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(candidate.ats_score)}`}>
                            {candidate.ats_score}% Match
                        </div>
                    )}
                </div>

                {/* Experience Summary */}
                {candidate.experience_summary && (
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Experience
                        </h4>
                        <p className="text-sm text-gray-600">{candidate.experience_summary}</p>
                    </div>
                )}

                {/* Skills */}
                <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-500" />
                        Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {candidate.skills?.slice(0, 6).map((skill, skillIndex) => {
                            const isMatching = candidate.matching_skills?.includes(skill);
                            return (
                                <Badge 
                                    key={skillIndex}
                                    variant={isMatching ? "default" : "outline"}
                                    className={isMatching ? "bg-green-100 text-green-800 border-green-300" : ""}
                                >
                                    {skill}
                                    {isMatching && <CheckCircle className="w-3 h-3 ml-1" />}
                                </Badge>
                            );
                        })}
                        {candidate.skills?.length > 6 && (
                            <Badge variant="outline" className="text-gray-500">
                                +{candidate.skills.length - 6} more
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Bio */}
                {candidate.bio && (
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{candidate.bio}</p>
                    </div>
                )}

                {/* ATS Score Progress */}
                {candidate.ats_score && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">ATS Compatibility</span>
                            <span className="text-sm font-semibold text-gray-900">{candidate.ats_score}%</span>
                        </div>
                        <Progress value={candidate.ats_score} className="h-2" />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        onClick={() => handlePreviewResume(candidate)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Resume
                    </Button>
                    {candidate.resume_url && (
                        <Button
                            variant="outline"
                            onClick={() => window.open(candidate.resume_url, '_blank')}
                            className="border-gray-300 hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            Top 5 AI-Analyzed Candidates
                            {job && (
                                <Badge variant="outline" className="ml-2">
                                    {job.title}
                                </Badge>
                            )}
                        </DialogTitle>
                        <p className="text-gray-600 mt-2">
                            AI-powered analysis based on resume-job description matching, skills alignment, and experience relevance.
                        </p>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                    <Brain className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mt-4">Analyzing Candidates</h3>
                                <p className="text-gray-600 mt-2">AI is evaluating resumes and matching them with job requirements...</p>
                            </div>
                        ) : topCandidates.length > 0 ? (
                            <div className="space-y-6">
                                {topCandidates.map((candidate, index) => (
                                    <CandidateCard key={candidate.id || index} candidate={candidate} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates to Analyze</h3>
                                <p className="text-gray-600 text-center max-w-md">
                                    This job doesn't have any applications yet. Once candidates apply, you'll be able to see AI-powered analysis here.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {topCandidates.length > 0 && (
                            <Button 
                                onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                            >
                                View All Applicants
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Resume Preview Modal */}
            <ResumeViewModal
                isOpen={showResumeModal}
                onClose={() => setShowResumeModal(false)}
                resumeUrl={selectedCandidate?.resume_url}
                candidateName={selectedCandidate?.name}
            />
        </>
    );
};

export default TopCandidatesModal;
