import express from 'express';
import { analyzeResume, scrapeJobs, generateResume } from '../controllers/career.controller.js';
import isAuthenticated from '../middllewares/isAuthenticated.js';

const router = express.Router();

// Route for resume analysis
router.route('/analyze').post(isAuthenticated, analyzeResume);

// Route for resume generation
router.route('/generate').post(isAuthenticated, generateResume);

// Route for job scraping (triggered from analysis)
router.route('/scrape-jobs').post(isAuthenticated, scrapeJobs);

export default router;
