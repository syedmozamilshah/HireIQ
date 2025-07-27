import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import CircularProgress from './ui/circular-progress';
import { Upload, Brain, Star, BookOpen, Code, Briefcase, Users, Download, Loader2, FileText, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from './shared/Navbar';
import GeneratedResumeModal from './GeneratedResumeModal';

const CareerAssistant = () => {
    const { user } = useSelector(store => store.auth);
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatingResume, setGeneratingResume] = useState(false);
    const [error, setError] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [generatedResumeData, setGeneratedResumeData] = useState(null);
    const [showGeneratedResume, setShowGeneratedResume] = useState(false);

    // Default job description for demo purposes
    const defaultJobDescription = `We are looking for a skilled Software Developer to join our team. 

    Key Requirements:
    - 3+ years of experience in software development
    - Proficiency in JavaScript, React, Node.js
    - Experience with databases (SQL, MongoDB)
    - Knowledge of cloud platforms (AWS, Azure)
    - Strong problem-solving skills
    - Experience with version control (Git)
    - Understanding of software development lifecycle
    - Good communication and teamwork skills

    Preferred Qualifications:
    - Experience with microservices architecture
    - Knowledge of containerization (Docker, Kubernetes)
    - Familiarity with CI/CD pipelines
    - Experience with testing frameworks
    - Knowledge of Redis and caching strategies

    We offer competitive salary, health benefits, flexible working hours, and opportunities for professional growth.`;

    useEffect(() => {
        // Pre-fill job description for demo
        setJobDescription(defaultJobDescription);
    }, []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
            toast.success('Resume uploaded successfully!');
        } else {
            toast.error('Please upload a PDF file');
        }
    };

    const analyzeResume = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        // Check if user is logged in and has resume, or has uploaded file
        if (!user && !resumeFile) {
            toast.error('Please upload your resume or login to use your saved resume');
            return;
        }

        if (user && !user.profile?.resumeOriginalName && !resumeFile) {
            toast.error('Please upload your resume first');
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysisData(null);
        
        try {
            let response;
            
            if (user && user.profile?.resumeOriginalName && !resumeFile) {
                // User is logged in with saved resume - use Express backend integration with LangGraph
                console.log('Using Express backend integration for logged-in user with saved resume');
                response = await axios.post(
                    'http://localhost:3000/api/v1/career/analyze',
                    { jobDescription },
                    { 
                        withCredentials: true,
                        timeout: 180000, // 3 minutes timeout for AI processing
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                // Either guest user OR logged-in user with uploaded file - direct call to Python backend
                if (!resumeFile) {
                    throw new Error('Please upload your resume');
                }

                console.log('Using direct Python backend call - Guest user or uploaded file');
                console.log('Resume file:', resumeFile.name, 'Size:', resumeFile.size, 'bytes');
                
                const formData = new FormData();
                formData.append('resume', resumeFile);
                formData.append('job_description', jobDescription);

                // Add onUploadProgress to track the upload
                response = await axios.post(
                    'http://localhost:8000/analyze',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        timeout: 180000, // 3 minutes timeout
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity,
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.lengthComputed) {
                                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                console.log('Upload progress:', percentCompleted + '%');
                            }
                        }
                    }
                );
            }

            console.log('Analysis response:', response.data);

            // Handle both response formats (Express backend vs direct Python backend)
            if (response.data.success || response.data.ats_score) {
                const analysisResult = response.data.analysis || response.data;
                
                // Validate the analysis result has required fields
                if (!analysisResult || !analysisResult.ats_score) {
                    throw new Error('Invalid analysis response format');
                }
                
                setAnalysisData(analysisResult);
                setShowAnalysis(true);
                toast.success('Resume analysis completed successfully!');
            } else {
                throw new Error(response.data.message || 'Analysis failed - no data returned');
            }
        } catch (error) {
            console.error('Resume analysis error:', error);
            
            let errorMessage = 'Failed to analyze resume';
            
            if (error.code === 'ECONNREFUSED') {
                errorMessage = 'Backend service is not running. Please contact support.';
            } else if (error.response?.status === 503) {
                errorMessage = 'AI analysis service is temporarily unavailable. Please try again.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Please log in again to continue.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
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
            const response = await axios.post(
                'http://localhost:8000/generate-resume',
                {
                    resume_text: analysisData.resume_text || '',
                    job_description: jobDescription,
                    analysis_results: JSON.stringify(analysisData)
                },
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

    const resetAnalysis = () => {
        setAnalysisData(null);
        setShowAnalysis(false);
        setError(null);
        setResumeFile(null);
        setJobDescription(defaultJobDescription);
    };

    const renderUploadSection = () => (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-500" />
                    Upload Your Resume
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {user && user.profile?.resumeOriginalName ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                <span className="text-green-800 font-medium">
                                    Using your saved resume: {user.profile.resumeOriginalName}
                                </span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                                You can also upload a different resume below if needed.
                            </p>
                        </div>
                    ) : !user ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                                <span className="text-blue-800 font-medium">
                                    Not logged in? No problem!
                                </span>
                            </div>
                            <p className="text-sm text-blue-600 mt-1">
                                Upload your resume below to get AI-powered analysis without creating an account.
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <span className="text-amber-800 font-medium">
                                    No resume found in your profile
                                </span>
                            </div>
                            <p className="text-sm text-amber-600 mt-1">
                                Please upload your resume below or update your profile.
                            </p>
                        </div>
                    )}

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="cursor-pointer">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-700">
                                {resumeFile ? `Selected: ${resumeFile.name}` : 'Click to upload your resume'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                PDF files only, max 10MB
                            </p>
                        </label>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderJobDescriptionSection = () => (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <p className="text-sm text-gray-600">
                    Paste the job description you want to analyze your resume against
                </p>
            </CardHeader>
            <CardContent>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                        {jobDescription.length} characters
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setJobDescription(defaultJobDescription)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                    >
                        Use Sample Job Description
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderAnalysisResults = () => {
        if (!analysisData) return null;

        return (
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
                                Generating...
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
                        onClick={resetAnalysis}
                        className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
                    >
                        <Brain className="h-4 w-4" />
                        New Analysis
                    </Button>
                </div>

                {/* ATS Score */}
                {analysisData.ats_score && (
                    <Card>
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
                                        value={analysisData.ats_score.score}
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
                                            {analysisData.ats_score.score >= 80 ? 'Excellent match!' : 
                                             analysisData.ats_score.score >= 60 ? 'Good match' :
                                             analysisData.ats_score.score >= 40 ? 'Needs improvement' : 'Poor match'}
                                        </div>
                                    </div>
                                </div>
                                
                                {analysisData.ats_score.breakdown && (
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        {Object.entries(analysisData.ats_score.breakdown).map(([key, value]) => (
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
                                
                                {analysisData.ats_score.feedback && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-700">{analysisData.ats_score.feedback}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Skills Analysis */}
                {analysisData.skills_analysis && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-5 w-5 text-green-500" />
                                Skills Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Missing Skills */}
                                {analysisData.skills_analysis.missing_skills && analysisData.skills_analysis.missing_skills.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-red-600 mb-2">Missing Skills to Add</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisData.skills_analysis.missing_skills.map((skill, index) => (
                                                <Badge key={index} className="bg-red-100 text-red-800">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Keyword Repetitions */}
                                {analysisData.skills_analysis.keyword_repetitions && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Writing Quality Analysis
                                        </h4>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700 mb-3">
                                                {analysisData.skills_analysis.keyword_repetitions.message}
                                            </p>
                                            
                                            {analysisData.skills_analysis.keyword_repetitions.repetitions && 
                                             Object.keys(analysisData.skills_analysis.keyword_repetitions.repetitions).length > 0 && (
                                                <div className="space-y-3">
                                                    {Object.entries(analysisData.skills_analysis.keyword_repetitions.repetitions).map(([word, data]) => (
                                                        <div key={word} className="bg-white p-3 rounded border">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-medium text-gray-800">
                                                                    "{word}" appears {data.count} times
                                                                </span>
                                                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                                                    Overused
                                                                </Badge>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-gray-600">Try these alternatives: </span>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {data.synonyms.map((synonym, idx) => (
                                                                        <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                                                            {synonym}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <div className="mt-3 p-3 bg-blue-100 rounded text-sm text-blue-800">
                                                <strong>Recommendation:</strong> {analysisData.skills_analysis.keyword_repetitions.recommendation}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Learning Roadmap */}
                {analysisData.learning_roadmap && analysisData.learning_roadmap.phases && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-purple-500" />
                                Learning Roadmap
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analysisData.learning_roadmap.phases.map((phase, index) => (
                                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                                        <h4 className="font-semibold">{phase.phase}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{phase.duration}</p>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {phase.skills.map((skill, skillIndex) => (
                                                <li key={skillIndex} className="text-gray-700">{skill}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Projects */}
                {analysisData.projects && analysisData.projects.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-orange-500" />
                                Suggested Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {analysisData.projects.map((project, index) => (
                                    <div key={index} className="border rounded-lg p-6 bg-gray-50">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-lg text-gray-900">{project.title}</h4>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className={
                                                    project.difficulty === 'Beginner' ? 'border-green-500 text-green-600' :
                                                    project.difficulty === 'Intermediate' ? 'border-yellow-500 text-yellow-600' :
                                                    project.difficulty === 'Advanced' ? 'border-orange-500 text-orange-600' :
                                                    'border-red-500 text-red-600'
                                                }>
                                                    {project.difficulty}
                                                </Badge>
                                                <Badge variant="secondary">{project.estimated_time}</Badge>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-700 mb-4 leading-relaxed">{project.description}</p>
                                        
                                        {project.skills_covered && (
                                            <div className="mb-4">
                                                <h5 className="font-medium text-gray-800 mb-2">Skills You'll Learn:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.skills_covered.map((skill, skillIdx) => (
                                                        <Badge key={skillIdx} className="bg-blue-100 text-blue-800">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {project.implementation_steps && (
                                            <div className="mb-4">
                                                <h5 className="font-medium text-gray-800 mb-2">Implementation Steps:</h5>
                                                <div className="bg-white rounded p-4 max-h-48 overflow-y-auto">
                                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                                        {project.implementation_steps.slice(0, 5).map((step, stepIdx) => (
                                                            <li key={stepIdx} className="text-gray-700">{step}</li>
                                                        ))}
                                                        {project.implementation_steps.length > 5 && (
                                                            <li className="text-gray-500 italic">...and {project.implementation_steps.length - 5} more steps</li>
                                                        )}
                                                    </ol>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {project.portfolio_value && (
                                            <div className="mt-4 p-3 bg-green-50 rounded border-l-4 border-green-400">
                                                <p className="text-sm text-green-800">
                                                    <strong>Portfolio Value:</strong> {project.portfolio_value}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Jobs */}
                {analysisData.jobs && analysisData.jobs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Related Job Opportunities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analysisData.jobs.map((job, index) => (
                                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-lg">{job.title}</h4>
                                                <p className="text-gray-600">{job.company}</p>
                                                <p className="text-sm text-gray-500">{job.location}</p>
                                            </div>
                                            {job.url && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => window.open(job.url, '_blank')}
                                                    className="shrink-0"
                                                >
                                                    View Job
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Interview Questions */}
                {analysisData.interview_questions && analysisData.interview_questions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-500" />
                                Interview Preparation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analysisData.interview_questions.map((q, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {q.category || 'General'}
                                                </Badge>
                                                <Badge variant="outline" className={
                                                    q.difficulty === 'Easy' ? 'border-green-500 text-green-600' :
                                                    q.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-600' :
                                                    'border-red-500 text-red-600'
                                                }>
                                                    {q.difficulty || 'Medium'}
                                                </Badge>
                                                {q.time_limit && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {q.time_limit}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <p className="font-medium text-gray-900 mb-3 leading-relaxed">{q.question}</p>
                                        
                                        {q.skill_tested && (
                                            <div className="mb-2">
                                                <span className="text-sm text-gray-600">Tests: </span>
                                                <Badge variant="secondary" className="text-xs">{q.skill_tested}</Badge>
                                            </div>
                                        )}
                                        
                                        {q.sample_input && q.sample_output && (
                                            <div className="bg-white p-3 rounded border mt-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-700">Input: </span>
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{q.sample_input}</code>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Output: </span>
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{q.sample_output}</code>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {q.hints && q.hints.length > 0 && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded">
                                                <span className="text-sm font-medium text-blue-800">Hints:</span>
                                                <ul className="list-disc list-inside mt-1 text-sm text-blue-700">
                                                    {q.hints.map((hint, hintIdx) => (
                                                        <li key={hintIdx}>{hint}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        AI Career Assistant
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Get AI-powered insights about your resume, discover skill gaps, 
                        and receive personalized career guidance to land your dream job.
                    </p>
                </div>

                {!showAnalysis ? (
                    <div className="max-w-4xl mx-auto">
                        {renderUploadSection()}
                        {renderJobDescriptionSection()}
                        
                        <div className="text-center">
                            <Button
                                onClick={analyzeResume}
                                disabled={loading}
                                size="lg"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        Analyzing Resume...
                                    </>
                                ) : (
                                    <>
                                        <Brain className="h-5 w-5 mr-2" />
                                        Analyze My Resume
                                    </>
                                )}
                            </Button>
                        </div>

                        {loading && (
                            <div className="mt-6 flex flex-col items-center justify-center py-16 space-y-6 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Brain className="h-8 w-8 text-blue-500" />
                                    </div>
                                </div>
                                <div className="text-center space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-800">Analyzing your resume...</h3>
                                    <p className="text-gray-600">AI is processing your resume and comparing it with the job requirements</p>
                                    
                                    {/* Enhanced step indicators */}
                                    <div className="space-y-3 text-sm text-gray-600 max-w-sm mx-auto">
                                        <div className="flex items-center justify-start gap-3 p-2 bg-white rounded-lg shadow-sm">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span className="flex-1 text-left">Reading Resume Content</span>
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div className="flex items-center justify-start gap-3 p-2 bg-white rounded-lg shadow-sm">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                            <span className="flex-1 text-left">Extracting Skills & Experience</span>
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="flex items-center justify-start gap-3 p-2 bg-white rounded-lg shadow-sm">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                            <span className="flex-1 text-left">Comparing to Job Description</span>
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="flex items-center justify-start gap-3 p-2 bg-white rounded-lg shadow-sm">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                                            <span className="flex-1 text-left">Calculating ATS Score</span>
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="flex items-center justify-start gap-3 p-2 bg-white rounded-lg shadow-sm">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                                            <span className="flex-1 text-left">Generating Recommendations</span>
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mt-6">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">This usually takes 30-60 seconds...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <p className="text-red-600">{error}</p>
                                <Button 
                                    variant="outline" 
                                    className="mt-2"
                                    onClick={analyzeResume}
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto">
                        {renderAnalysisResults()}
                    </div>
                )}
            </div>

            {/* Generated Resume Modal */}
            <GeneratedResumeModal 
                isOpen={showGeneratedResume}
                onClose={() => setShowGeneratedResume(false)}
                resumeData={generatedResumeData}
            />
        </div>
    );
};

export default CareerAssistant;
