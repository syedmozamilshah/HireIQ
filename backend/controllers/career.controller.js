import { User } from '../models/user.model.js';
import { createPythonBackendClient, retryRequest, checkPythonBackendHealth } from '../utils/connection.js';

// Create Python backend client with enhanced error handling
const pythonClient = createPythonBackendClient();

export const analyzeResume = async (req, res) => {
// Handle client disconnect without affecting Python request
req.on('close', () => {
    console.log('Client disconnected during analysis');
});
    
    try {
        const { jobDescription } = req.body;
        const userId = req.id;

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required",
                success: false
            });
        }

        // Get user's resume from MongoDB
        const user = await User.findById(userId);
        if (!user || !user.profile.resumeBase64) {
            return res.status(400).json({
                message: "No resume found. Please upload your resume first.",
                success: false
            });
        }

        // Prepare FormData for Python backend using form-data package
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        
        // Convert base64 to buffer
        const resumeBuffer = Buffer.from(user.profile.resumeBase64, 'base64');
        
        formData.append('resume', resumeBuffer, {
            filename: user.profile.resumeOriginalName || 'resume.pdf',
            contentType: 'application/pdf'
        });
        formData.append('job_description', jobDescription);

        // Check Python backend health first
        const isHealthy = await checkPythonBackendHealth();
        if (!isHealthy) {
            return res.status(503).json({
                message: "AI analysis service is currently unavailable. Please ensure the Python backend is running.",
                success: false
            });
        }

        // Call Python backend for analysis with retry logic
        const response = await retryRequest(async () => {
            return await pythonClient.post('/analyze', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'X-Fast-Mode': 'true', // Signal for optimized processing
                },
                // Don't use signal for now to avoid cancellation issues
                timeout: 300000, // 5 minutes timeout
            });
        }, 2, 2000); // 2 retries with 2 second base delay

        return res.status(200).json({
            message: "Resume analysis completed successfully",
            analysis: response.data,
            success: true
        });

    } catch (error) {
        console.error('Career analysis error:', error);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: "AI analysis service is currently unavailable. Please try again later.",
                success: false
            });
        }

        return res.status(500).json({
            message: "Failed to analyze resume. Please try again.",
            success: false,
            error: error.message
        });
    }
};

export const scrapeJobs = async (req, res) => {
    try {
        const { resumeData } = req.body;
        
        if (!resumeData) {
            return res.status(400).json({
                message: "Resume data is required for job scraping",
                success: false
            });
        }

        // Check Python backend health first
        const isHealthy = await checkPythonBackendHealth();
        if (!isHealthy) {
            return res.status(503).json({
                message: "Job scraping service is currently unavailable. Please ensure the Python backend is running.",
                success: false
            });
        }

        // Call Python backend for job scraping with retry logic
        const response = await retryRequest(async () => {
            return await pythonClient.post('/api/scrape-jobs', {
                resume: resumeData
            });
        }, 2, 1000); // 2 retries with 1 second base delay

        return res.status(200).json({
            message: "Job scraping completed successfully",
            jobs: response.data.jobs,
            success: true
        });

    } catch (error) {
        console.error('Job scraping error:', error);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: "Job scraping service is currently unavailable. Please try again later.",
                success: false
            });
        }

        return res.status(500).json({
            message: "Failed to scrape jobs. Please try again.",
            success: false,
            error: error.message
        });
    }
};

export const generateResume = async (req, res) => {
    // Handle client disconnect without affecting Python request
    req.on('close', () => {
        console.log('Client disconnected during resume generation');
    });
    
    try {
        const { resume_text, job_description, analysis_results } = req.body;
        const userId = req.id;

        if (!resume_text || !job_description || !analysis_results) {
            return res.status(400).json({
                message: "Resume text, job description, and analysis results are required",
                success: false
            });
        }

        // Prepare FormData for Python backend
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        
        formData.append('resume_text', resume_text);
        formData.append('job_description', job_description);
        formData.append('analysis_results', analysis_results);

        // Check Python backend health first
        const isHealthy = await checkPythonBackendHealth();
        if (!isHealthy) {
            return res.status(503).json({
                message: "Resume generation service is currently unavailable. Please ensure the Python backend is running.",
                success: false
            });
        }

        // Call Python backend for resume generation with retry logic
        const response = await retryRequest(async () => {
            return await pythonClient.post('/generate-resume', formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 180000, // 3 minutes timeout
            });
        }, 2, 2000); // 2 retries with 2 second base delay

        return res.status(200).json({
            message: "Resume generated successfully",
            success: true,
            resume_data: response.data.resume_data
        });

    } catch (error) {
        console.error('Resume generation error:', error);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: "Resume generation service is currently unavailable. Please try again later.",
                success: false
            });
        }

        if (error.response?.status === 400) {
            return res.status(400).json({
                message: error.response.data?.detail || "Invalid request data for resume generation",
                success: false
            });
        }

        return res.status(500).json({
            message: "Failed to generate resume. Please try again.",
            success: false,
            error: error.message
        });
    }
};
