import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import CircularProgress from './ui/circular-progress';
import { Star, BookOpen, Code, Briefcase, Users, X, Loader2, Download, FileText, Target, Brain } from 'lucide-react';
import GeneratedResumeModal from './GeneratedResumeModal';
import axios from 'axios';
import { toast } from 'sonner';

const ResumeAnalysisModal = ({ isOpen, onClose, jobId }) => {
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatingResume, setGeneratingResume] = useState(false);
    const [generatedResumeData, setGeneratedResumeData] = useState(null);
    const [showGeneratedResume, setShowGeneratedResume] = useState(false);

    useEffect(() => {
        if (isOpen && jobId) {
            analyzeResume();
        }
    }, [isOpen, jobId]);

    const analyzeResume = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // First get the job details to extract the job description
            const jobResponse = await axios.get(
                `http://localhost:3000/api/v1/job/get/${jobId}`,
                { withCredentials: true }
            );
            
            if (!jobResponse.data.success) {
                throw new Error('Failed to fetch job details');
            }
            
            const jobDescription = jobResponse.data.job.description;
            
            const response = await axios.post(
                'http://localhost:3000/api/v1/career/analyze',
                { jobDescription },
                { 
                    withCredentials: true,
                    timeout: 180000 // 3 minutes timeout for AI processing
                }
            );

            if (response.data.success) {
                setAnalysisData(response.data.analysis);
                toast.success('Resume analysis completed successfully!');
            } else {
                throw new Error(response.data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Resume analysis error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to analyze resume');
            toast.error('Failed to analyze resume');
        } finally {
            setLoading(false);
        }
    };

const generateOptimizedResume = async () => {
        if (!analysisData) {
            toast.error('Please complete analysis first');
            return;
        }

        setGeneratingResume(true);
        
        try {
            // Get job details for resume generation
            const jobResponse = await axios.get(
                `http://localhost:3000/api/v1/job/get/${jobId}`,
                { withCredentials: true }
            );
            
            if (!jobResponse.data.success) {
                throw new Error('Failed to fetch job details');
            }
            
            const jobDescription = jobResponse.data.job.description;
            
            // Call the generate resume endpoint
            const response = await axios.post(
                'http://localhost:8000/generate-resume',
                new URLSearchParams({
                    resume_text: analysisData.resume_text || '',
                    job_description: jobDescription,
                    analysis_results: JSON.stringify(analysisData)
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (response.data.success) {
                // Set the generated resume data and show the modal
                const resumeData = response.data.resume_data;
                setGeneratedResumeData(resumeData);
                setShowGeneratedResume(true);
                
                toast.success('Optimized resume generated!');
            } else {
                throw new Error(response.data.message || 'Resume generation failed');
            }
        } catch (error) {
            console.error('Resume generation error:', error);
            toast.error(error.response?.data?.detail || error.message || 'Failed to generate resume');
        } finally {
            setGeneratingResume(false);
        }
    };

    const renderATSScore = (atsScore) => {
        if (!atsScore) return null;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        ATS Score
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col items-center">
                            <CircularProgress
                                value={atsScore.score}
                                size={140}
                                strokeWidth={10}
                                className="mx-auto mb-4"
                                label="ATS Score"
                                color="auto"
                            />
                            <div className="text-center">
                                <div className="text-lg font-semibold text-gray-700">
                                    Overall ATS Compatibility
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {atsScore.score >= 80 ? 'Excellent match!' : 
                                     atsScore.score >= 60 ? 'Good match' :
                                     atsScore.score >= 40 ? 'Needs improvement' : 'Poor match'}
                                </div>
                            </div>
                        </div>
                        
                        {atsScore.breakdown && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {Object.entries(atsScore.breakdown).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                        <div className="font-semibold capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-lg font-bold text-gray-600">
                                            {typeof value === 'number' ? `${value.toFixed(1)}%` : value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {atsScore.feedback && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-700">{atsScore.feedback}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderSkillsAnalysis = (skillsAnalysis) => {
        if (!skillsAnalysis) return null;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-green-500" />
                        Skills Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {skillsAnalysis.matched_skills && (
                            <div>
                                <h4 className="font-semibold text-green-600 mb-2">Matched Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {skillsAnalysis.matched_skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {skillsAnalysis.missing_skills && (
                            <div>
                                <h4 className="font-semibold text-red-600 mb-2">Missing Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {skillsAnalysis.missing_skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderLearningRoadmap = (roadmap) => {
        if (!roadmap || !roadmap.phases) return null;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                        Learning Roadmap
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {roadmap.phases.map((phase, index) => (
                            <div key={index} className="border-l-4 border-purple-500 pl-4">
                                <h4 className="font-semibold">{phase.phase}</h4>
                                <p className="text-sm text-gray-600 mb-2">{phase.duration}</p>
                            <ul className="list-decimal list-inside text-sm space-y-1">
                                    {phase.skills.map((skill, skillIndex) => (
                                        <li key={skillIndex} className="text-gray-700">{skill}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderProjects = (projects) => {
        if (!projects || projects.length === 0) return null;

        const [showAllProjects, setShowAllProjects] = useState(false);
        const initialDisplayCount = 3;
        const hasMoreProjects = projects.length > initialDisplayCount;
        const displayedProjects = showAllProjects ? projects : projects.slice(0, initialDisplayCount);
        const remainingCount = projects.length - initialDisplayCount;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-orange-500" />
                            Suggested Projects
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {projects.length} projects
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {displayedProjects.map((project, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">{cleanAIContent(project.title)}</h4>
                                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{cleanAIContent(project.description)}</p>
                                <div className="flex justify-between items-center">
                                    <Badge variant="outline" className={
                                        project.difficulty === 'Beginner' ? 'border-green-500 text-green-600' :
                                        project.difficulty === 'Intermediate' ? 'border-yellow-500 text-yellow-600' :
                                        'border-red-500 text-red-600'
                                    }>
                                        {project.difficulty}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{project.estimated_time}</span>
                                </div>
                            </div>
                        ))}
                        
                        {hasMoreProjects && (
                            <div className="text-center pt-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setShowAllProjects(!showAllProjects)}
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                    {showAllProjects 
                                        ? 'Show Less' 
                                        : `Show ${remainingCount} More Project${remainingCount > 1 ? 's' : ''}`
                                    }
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Utility function to clean AI-generated content
    const cleanAIContent = (content) => {
        if (!content) return '';
        return content
            .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // Remove bold markdown
            .replace(/#{1,6}\s*/g, '') // Remove headers
            .replace(/\*\s*/g, '• ') // Convert asterisks to bullet points
            .replace(/^\s*[-•]\s*/gm, '• ') // Normalize bullet points
            .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
            .trim();
    };

    const renderJobs = (jobs) => {
        if (!jobs || jobs.length === 0) return null;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Related Job Opportunities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {jobs.map((job, index) => (
                            <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">{cleanAIContent(job.title)}</h4>
                                        <p className="text-sm text-gray-600">{cleanAIContent(job.company)}</p>
                                        <p className="text-xs text-gray-500">{cleanAIContent(job.location)}</p>
                                    </div>
                                    {job.url && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => window.open(job.url, '_blank')}
                                        >
                                            View Job
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderInterviewQuestions = (questions) => {
        if (!questions || questions.length === 0) return null;
        
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-500" />
                        Interview Preparation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {questions.map((q, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge variant="outline" className="text-xs bg-white">
                                        {cleanAIContent(q.category || 'General')}
                                    </Badge>
                                    <Badge variant="outline" className={
                                        q.difficulty === 'Easy' ? 'border-green-500 text-green-600 bg-green-50' :
                                        q.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                                        'border-red-500 text-red-600 bg-red-50'
                                    }>
                                        {q.difficulty || 'Medium'}
                                    </Badge>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                        {index + 1}
                                    </div>
                                    <p className="text-sm font-medium text-gray-800 leading-relaxed">
                                        {cleanAIContent(q.question)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={loading ? () => {} : onClose}>
                <DialogContent 
                    className="max-w-4xl max-h-[90vh] overflow-y-auto" 
                    showCloseButton={!loading}
                    onInteractOutside={loading ? (e) => e.preventDefault() : undefined}
                    onEscapeKeyDown={loading ? (e) => e.preventDefault() : undefined}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">
                            Resume Analysis Results
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-4">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Brain className="h-6 w-6 text-blue-500" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-800">Analyzing your resume...</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span>Reading Resume Content</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                            <span>Comparing to Job Description</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                            <span>Calculating ATS Score</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                                            <span>Generating Recommendations</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">This usually takes 30-60 seconds...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <p className="text-red-600">{error}</p>
                                <Button 
                                    variant="outline" 
                                    className="mt-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                                    onClick={analyzeResume}
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {analysisData && !loading && (
                            <div className="space-y-6">
                                {/* Action Buttons */}
                                <div className="flex justify-center gap-4 mb-6">
                                    <Button 
                                        onClick={generateOptimizedResume}
                                        disabled={generatingResume}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2 shadow-lg"
                                    >
                                        {generatingResume ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Generating Resume...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4" />
                                                Generate Optimized Resume
                                            </>
                                        )}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
                                    >
                                        <X className="h-4 w-4" />
                                        Close
                                    </Button>
                                </div>
                                
                                {renderATSScore(analysisData.ats_score)}
                                {renderSkillsAnalysis(analysisData.skills_analysis)}
                                {renderLearningRoadmap(analysisData.learning_roadmap)}
                                {renderProjects(analysisData.projects)}
                                {renderJobs(analysisData.jobs)}
                                {renderInterviewQuestions(analysisData.interview_questions)}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Generated Resume Modal */}
            <GeneratedResumeModal 
                isOpen={showGeneratedResume}
                onClose={() => setShowGeneratedResume(false)}
                resumeData={generatedResumeData}
            />
        </>
    );
};

export default ResumeAnalysisModal;
