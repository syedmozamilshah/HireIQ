import express from 'express';
import { analyzeResumeAPI, getResume, generateResume, analyzeCandidates } from '../controllers/resume.controller.js';

const router = express.Router();

// Route to analyze resume against a job posting
router.post('/analyze', analyzeResumeAPI);

// Route to generate a resume
router.post('/generate', generateResume);

// Route to analyze top candidates for a job
router.post('/analyze-candidates', analyzeCandidates);

// Route to get resume data (for recruiters to view candidate resumes)
router.get('/:userId', getResume);

export default router;
