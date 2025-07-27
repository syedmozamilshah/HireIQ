import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Resume analysis using career-assistant Python backend
export const analyzeResume = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.cookies.userId;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required",
                success: false
            });
        }

        // Get user's resume
        const user = await User.findById(userId);
        if (!user || !user.profile.resumeBase64) {
            return res.status(400).json({
                message: "Resume not found. Please upload your resume first.",
                success: false
            });
        }

        // Get job details
        const job = await Job.findById(jobId).populate('company');
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Create job description from job data
        const jobDescription = `
Job Title: ${job.title}
Company: ${job.company?.name || 'Not specified'}
Location: ${job.location}
Job Type: ${job.jobType}
Experience Level: ${job.experienceLevel} years
Salary: ${job.salary}

Job Description:
${job.description}

Requirements:
${job.requirements ? job.requirements.join('\n') : 'Not specified'}
        `.trim();

        // Convert base64 resume to temporary PDF file
        const resumeBuffer = Buffer.from(user.profile.resumeBase64, 'base64');
        const tempResumeFile = path.join(process.cwd(), 'temp', `resume_${userId}_${Date.now()}.pdf`);
        
        // Ensure temp directory exists
        const tempDir = path.dirname(tempResumeFile);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        fs.writeFileSync(tempResumeFile, resumeBuffer);

        // Call career-assistant Python backend
        const pythonScript = path.join(process.cwd(), 'python-backend', 'main.py');
        
        const pythonProcess = spawn('python', [pythonScript, 'analyze'], {
            cwd: path.join(process.cwd(), 'python-backend')
        });

        let responseData = '';
        let errorData = '';

        // Send data to Python process
        const requestData = JSON.stringify({
            resume_file: tempResumeFile,
            job_description: jobDescription
        });
        
        pythonProcess.stdin.write(requestData);
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            responseData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            // Clean up temp file
            try {
                fs.unlinkSync(tempResumeFile);
            } catch (err) {
                console.error('Error cleaning up temp file:', err);
            }

            if (code === 0) {
                try {
                    const analysisResult = JSON.parse(responseData);
                    return res.status(200).json({
                        message: "Resume analysis completed successfully",
                        success: true,
                        analysis: analysisResult
                    });
                } catch (parseError) {
                    console.error('Error parsing Python response:', parseError);
                    return res.status(500).json({
                        message: "Error processing analysis results",
                        success: false
                    });
                }
            } else {
                console.error('Python process error:', errorData);
                return res.status(500).json({
                    message: "Resume analysis failed",
                    success: false,
                    error: errorData
                });
            }
        });

    } catch (error) {
        console.error("Resume analysis error:", error);
        return res.status(500).json({
            message: `Internal server error: ${error.message}`,
            success: false
        });
    }
};

// Alternative implementation using HTTP request to Python FastAPI server
export const analyzeResumeAPI = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.cookies.userId;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required",
                success: false
            });
        }

        // Get user's resume
        const user = await User.findById(userId);
        if (!user || !user.profile.resumeBase64) {
            return res.status(400).json({
                message: "Resume not found. Please upload your resume first.",
                success: false
            });
        }

        // Get job details
        const job = await Job.findById(jobId).populate('company');
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Create job description from job data
        const jobDescription = `
Job Title: ${job.title}
Company: ${job.company?.name || 'Not specified'}
Location: ${job.location}
Job Type: ${job.jobType}
Experience Level: ${job.experienceLevel} years
Salary: ${job.salary}

Job Description:
${job.description}

Requirements:
${job.requirements ? job.requirements.join('\n') : 'Not specified'}
        `.trim();

        // Convert base64 to buffer for FormData
        const resumeBuffer = Buffer.from(user.profile.resumeBase64, 'base64');
        
        // Create FormData for the Python API call
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        
        formData.append('resume', resumeBuffer, {
            filename: user.profile.resumeOriginalName || 'resume.pdf',
            contentType: 'application/pdf'
        });
        formData.append('job_description', jobDescription);

        // Make request to Python FastAPI server
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:8000/analyze', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Python API error: ${response.status} ${response.statusText}`);
        }

        const analysisResult = await response.json();

        return res.status(200).json({
            message: "Resume analysis completed successfully",
            success: true,
            analysis: analysisResult
        });

    } catch (error) {
        console.error("Resume analysis error:", error);
        return res.status(500).json({
            message: `Resume analysis failed: ${error.message}`,
            success: false
        });
    }
};

// Get user's resume for viewing
export const getResume = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.cookies.userId;
        const userRole = req.cookies.userRole;

        // Only allow users to view their own resume or recruiters to view applicant resumes
        if (userId !== requestingUserId && userRole !== 'recruiter') {
            return res.status(403).json({
                message: "Access denied",
                success: false
            });
        }

        const user = await User.findById(userId);
        if (!user || !user.profile.resumeBase64) {
            return res.status(404).json({
                message: "Resume not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Resume retrieved successfully",
            success: true,
            resume: {
                fileName: user.profile.resumeOriginalName || 'resume.pdf',
                data: user.profile.resumeBase64
            }
        });

    } catch (error) {
        console.error("Get resume error:", error);
        return res.status(500).json({
            message: `Internal server error: ${error.message}`,
            success: false
        });
    }
};

// Generate optimized resume using Python backend
export const generateResume = async (req, res) => {
    try {
        const { resume_text, job_description, analysis_results } = req.body;
        const userId = req.cookies.userId;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        if (!resume_text || !job_description || !analysis_results) {
            return res.status(400).json({
                message: "Resume text, job description, and analysis results are required",
                success: false
            });
        }

        // Create FormData for the Python API call
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        
        formData.append('resume_text', resume_text);
        formData.append('job_description', job_description);
        formData.append('analysis_results', analysis_results);

        // Make request to Python FastAPI server
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:8000/generate-resume', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Python API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();

        return res.status(200).json({
            message: "Resume generated successfully",
            success: true,
            resume_data: result.resume_data
        });

    } catch (error) {
        console.error("Resume generation error:", error);
        return res.status(500).json({
            message: `Resume generation failed: ${error.message}`,
            success: false
        });
    }
};

// Analyze top candidates for a job using AI
export const analyzeCandidates = async (req, res) => {
    try {
        const { jobId } = req.query;
        const userId = req.cookies.userId;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required",
                success: false
            });
        }

        // Get job details
        const job = await Job.findById(jobId).populate('company').populate('applications');
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Check if the user is the job creator
        if (job.created_by.toString() !== userId) {
            return res.status(403).json({
                message: "Access denied. You can only analyze candidates for your own jobs.",
                success: false
            });
        }

        // Get all applications with applicant details
        const applications = await Application.find({ job: jobId })
            .populate('applicant', 'fullname email profile')
            .lean();

        if (!applications.length) {
            return res.status(200).json({
                message: "No applications found for this job",
                success: true,
                topCandidates: []
            });
        }

        // Create job description for AI analysis
        const jobDescription = `
Job Title: ${job.title}
Company: ${job.company?.name || 'Not specified'}
Location: ${job.location}
Job Type: ${job.jobType}
Experience Level: ${job.experienceLevel} years
Salary: ${job.salary}

Job Description:
${job.description}

Requirements:
${job.requirements ? job.requirements.join('\n') : 'Not specified'}
        `.trim();

        // Prepare candidate data for AI analysis
        const candidates = [];
        for (const application of applications) {
            const applicant = application.applicant;
            if (applicant && applicant.profile && applicant.profile.resumeBase64) {
                candidates.push({
                    id: applicant._id,
                    name: applicant.fullname,
                    email: applicant.email,
                    skills: applicant.profile.skills || [],
                    resumeBase64: applicant.profile.resumeBase64,
                    resumeOriginalName: applicant.profile.resumeOriginalName || 'resume.pdf'
                });
            }
        }

        if (!candidates.length) {
            return res.status(200).json({
                message: "No candidates with resumes found",
                success: true,
                topCandidates: []
            });
        }

        // Use Python backend with LangGraph for AI analysis
        const scoredCandidates = await analyzeCandidatesWithAI(candidates, jobDescription);
        
        // Sort by score and get top 5
        const topCandidates = scoredCandidates
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(candidate => ({
                _id: candidate.id,
                name: candidate.name,
                email: candidate.email,
                skills: candidate.skills,
                score: candidate.score,
                experienceSummary: candidate.experienceSummary || 'Experience summary not available',
                atsScore: Math.round(candidate.score * 10) // Convert to ATS score out of 10
            }));

        return res.status(200).json({
            message: "Top candidates analyzed successfully",
            success: true,
            topCandidates
        });

    } catch (error) {
        console.error("Analyze candidates error:", error);
        return res.status(500).json({
            message: `Internal server error: ${error.message}`,
            success: false
        });
    }
};

// AI-powered candidate analysis using Python LangGraph backend
async function analyzeCandidatesWithAI(candidates, jobDescription) {
    try {
        const fetch = (await import('node-fetch')).default;
        
        // Call Python backend for AI analysis
        const response = await fetch('http://localhost:8000/analyze-candidates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                job_description: jobDescription,
                candidates: candidates
            })
        });
        
        if (!response.ok) {
            throw new Error(`Python API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        return result.top_candidates || [];
        
    } catch (error) {
        console.error('AI analysis failed, falling back to basic scoring:', error);
        
        // Fallback to basic scoring if AI analysis fails
        return await scoreCandidatesBasic(candidates, jobDescription);
    }
}

// Fallback basic scoring function
async function scoreCandidatesBasic(candidates, jobDescription) {
    const jobSkills = extractSkillsFromJobDescription(jobDescription);
    
    return candidates.map(candidate => {
        let score = 0;
        
        // Skill matching (60% of score)
        const candidateSkills = candidate.skills.map(skill => skill.toLowerCase());
        const matchingSkills = jobSkills.filter(skill => 
            candidateSkills.some(cSkill => cSkill.includes(skill.toLowerCase()))
        );
        const skillScore = (matchingSkills.length / Math.max(jobSkills.length, 1)) * 0.6;
        score += skillScore;
        
        // Basic scoring based on profile completeness (40% of score)
        let profileScore = 0;
        if (candidate.name && candidate.name.length > 0) profileScore += 0.1;
        if (candidate.email && candidate.email.includes('@')) profileScore += 0.1;
        if (candidate.skills && candidate.skills.length > 0) profileScore += 0.2;
        
        score += profileScore;
        
        // Add some randomness to simulate variation
        score += Math.random() * 0.1;
        
        return {
            ...candidate,
            score: Math.min(score, 1), // Cap at 1.0
            experienceSummary: `${candidate.skills.length} skills listed, matches ${matchingSkills.length} job requirements`,
            atsScore: Math.round(score * 100)
        };
    });
}

// Extract skills from job description (simple keyword extraction)
function extractSkillsFromJobDescription(jobDescription) {
    const commonSkills = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
        'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Docker',
        'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Jenkins', 'CI/CD',
        'Machine Learning', 'Data Science', 'AI', 'REST API', 'GraphQL',
        'TypeScript', 'PHP', 'C++', 'C#', '.NET', 'Spring Boot', 'Django',
        'Flask', 'Express', 'Redux', 'Next.js', 'Tailwind CSS', 'Bootstrap'
    ];
    
    const jobDescriptionLower = jobDescription.toLowerCase();
    return commonSkills.filter(skill => 
        jobDescriptionLower.includes(skill.toLowerCase())
    );
}
