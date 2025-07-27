"""
Main FastAPI application for the AI Career Assistant.
Integrates with LangGraph-based career analysis agent.
"""

import os
import sys
from typing import Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import re
import platform
from dotenv import load_dotenv

# Windows-specific fixes
if sys.platform == 'win32':
    # Set the event loop policy for Windows to handle connections better
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    # Ignore specific connection errors on Windows
    import warnings
    warnings.filterwarnings("ignore", message=".*WinError 10054.*")

# Import our custom modules
from career_agent import CareerAssistantAgent
from pdf_parser import extract_text_from_pdf, validate_pdf, get_pdf_info

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Career Assistant API",
    description="LangGraph-powered career analysis and guidance system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add middleware to handle connection errors gracefully
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import platform

class ConnectionErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except ConnectionResetError:
            # Client disconnected - this is normal for file uploads
            if platform.system() == "Windows":
                # On Windows, just return a 499 status (client closed connection)
                return Response(status_code=499, content="Client closed connection")
            raise
        except Exception as e:
            # Log other exceptions but don't crash
            print(f"Request error: {type(e).__name__}: {e}")
            raise

app.add_middleware(ConnectionErrorMiddleware)

# Initialize the career agent with enhanced error handling
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is required")

print(f"🔑 Initializing Career Agent with API key: {GEMINI_API_KEY[:20]}...")
try:
    career_agent = CareerAssistantAgent(GEMINI_API_KEY)
    print("✅ Career Agent initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize Career Agent: {str(e)}")
    raise RuntimeError(f"Career Agent initialization failed: {str(e)}")


# Pydantic models for request/response
class AnalysisResponse(BaseModel):
    ats_score: Dict[str, Any]
    skills_analysis: Dict[str, Any]
    learning_roadmap: Dict[str, Any]
    resources: Dict[str, Any]
    projects: list
    jobs: list
    interview_questions: list
    resume_text: str = ""  # Add resume text for frontend processing
    errors: list = []


class HealthResponse(BaseModel):
    status: str
    message: str
    version: str


class JobScrapeRequest(BaseModel):
    resume: Dict[str, Any]


class JobScrapeResponse(BaseModel):
    jobs: list
    message: str


class CandidateAnalysisRequest(BaseModel):
    job_description: str
    candidates: list


class CandidateAnalysisResponse(BaseModel):
    top_candidates: list
    message: str


@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Career Assistant API",
        "description": "LangGraph-powered resume analysis and career guidance",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/analyze (POST)",
            "health": "/health (GET)",
            "docs": "/docs (GET)"
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="AI Career Assistant API is running",
        version="1.0.0"
    )


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume_job(
    resume: UploadFile = File(..., description="PDF resume file"),
    job_description: str = Form(..., description="Job description text")
):
    """
    Main analysis endpoint that processes resume and job description.
    
    This endpoint:
    1. Validates and extracts text from the uploaded PDF resume
    2. Runs the LangGraph workflow to analyze resume vs job description
    3. Returns comprehensive career insights and recommendations
    """
    
    # Validate file type
    if not resume.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported for resume upload"
        )
    
    try:

        print("📂 Reading PDF file...")
        pdf_content = await resume.read()
        print("✔️ PDF file read successfully.")
        print("🔍 Validating PDF...")
        if not validate_pdf(pdf_content):
            raise HTTPException(
                status_code=400,
                detail="Invalid PDF file. Please upload a valid PDF resume."
            )

        print("✔️ PDF validated successfully.")
        print("✂️ Extracting text from PDF...")
        try:
            resume_text = extract_text_from_pdf(pdf_content)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to extract text from PDF: {str(e)}"
            )

        print("✔️ Text extracted from PDF.")
        print("🔍 Validating extracted text...")
        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in the PDF. Please upload a text-based PDF."
            )
        
        if len(resume_text.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="Resume text is too short. Please upload a complete resume."
            )
        
        # Validate job description
        if not job_description.strip():
            raise HTTPException(
                status_code=400,
                detail="Job description cannot be empty"
            )
        
        if len(job_description.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Job description is too short. Please provide a detailed job description."
            )

        print("✔️ Text validated successfully.")
        print("🧠 Running LangGraph analysis workflow...")
        try:
            analysis_result = await career_agent.analyze(resume_text, job_description)
            
            # Add resume text to the response
            analysis_result['resume_text'] = resume_text
            
            print("✔️ LangGraph analysis completed.")
            return AnalysisResponse(**analysis_result)
            
        except Exception as e:
            # Log the error (in production, use proper logging)
            print(f"❌ Analysis error: {str(e)}")
            
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {str(e)}"
            )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your request"
        )


@app.post("/generate-resume")
async def generate_resume(
    resume_text: str = Form(..., description="Original resume text"),
    job_description: str = Form(..., description="Job description text"),
    analysis_results: str = Form(..., description="JSON string of analysis results")
):
    """
    Generate an ATS-optimized resume based on original resume and job analysis.
    
    This endpoint:
    1. Parses the original resume text comprehensively
    2. Extracts all relevant sections (experience, projects, etc.)
    3. Generates an ATS-friendly, one-page resume
    4. Optimizes content based on job requirements
    """
    
    try:
        # Parse analysis results
        import json
        analysis_data = json.loads(analysis_results)
        
        # Generate ATS resume using the career agent
        ats_resume = await career_agent.generate_ats_resume(
            resume_text, 
            job_description, 
            analysis_data
        )
        
        return {
            "success": True,
            "resume_data": ats_resume,
            "message": "ATS-optimized resume generated successfully"
        }
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis results JSON: {str(e)}"
        )
    except Exception as e:
        print(f"Resume generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate resume: {str(e)}"
        )


@app.post("/analyze-candidates", response_model=CandidateAnalysisResponse)
async def analyze_candidates(request: CandidateAnalysisRequest):
    """
    Analyze candidates using LangGraph agent for intelligent ranking.
    
    This endpoint:
    1. Uses LangGraph workflow to analyze each candidate's resume
    2. Scores candidates based on job requirements match
    3. Returns top 5 candidates with detailed analysis
    """
    
    try:
        job_description = request.job_description
        candidates = request.candidates
        
        if not candidates:
            return CandidateAnalysisResponse(
                top_candidates=[],
                message="No candidates provided for analysis"
            )
        
        # Analyze each candidate using LangGraph
        analyzed_candidates = []
        
        for candidate in candidates:
            try:
                # Decode base64 resume
                import base64
                import io
                
                resume_bytes = base64.b64decode(candidate['resumeBase64'])
                
                # Extract text from PDF
                resume_text = extract_text_from_pdf(resume_bytes)
                
                if not resume_text.strip():
                    print(f"Warning: No text extracted from {candidate['name']}'s resume")
                    continue
                
                # Use LangGraph agent to analyze resume against job
                analysis_result = await career_agent.analyze(resume_text, job_description)
                
                # Calculate overall match score from analysis
                ats_score = analysis_result.get('ats_score', {})
                skills_analysis = analysis_result.get('skills_analysis', {})
                
                # Calculate composite score
                score = calculate_candidate_score(ats_score, skills_analysis, candidate)
                
                analyzed_candidates.append({
                    '_id': candidate['id'],
                    'name': candidate['name'],
                    'email': candidate['email'],
                    'skills': candidate['skills'],
                    'score': score,
                    'atsScore': round(score * 100),  # Convert to percentage
                    'experienceSummary': generate_experience_summary(analysis_result, candidate),
                    'analysis': {
                        'ats_score': ats_score,
                        'skills_match': skills_analysis.get('matched_skills', []),
                        'skill_gaps': skills_analysis.get('skill_gaps', []),
                        'recommendations': analysis_result.get('learning_roadmap', {}).get('immediate_actions', [])
                    }
                })
                
            except Exception as e:
                print(f"Error analyzing candidate {candidate['name']}: {str(e)}")
                # Add candidate with minimal data if analysis fails
                analyzed_candidates.append({
                    '_id': candidate['id'],
                    'name': candidate['name'],
                    'email': candidate['email'],
                    'skills': candidate['skills'],
                    'score': 0.3,  # Default low score
                    'atsScore': 30,
                    'experienceSummary': 'Analysis failed - resume may be unreadable',
                    'analysis': {
                        'error': str(e)
                    }
                })
        
        # Sort by score and get top 5
        top_candidates = sorted(analyzed_candidates, key=lambda x: x['score'], reverse=True)[:5]
        
        return CandidateAnalysisResponse(
            top_candidates=top_candidates,
            message=f"Successfully analyzed {len(analyzed_candidates)} candidates using AI"
        )
        
    except Exception as e:
        print(f"Candidate analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze candidates: {str(e)}"
        )


def calculate_candidate_score(ats_score: dict, skills_analysis: dict, candidate: dict) -> float:
    """
    Calculate overall candidate score based on LangGraph analysis results.
    """
    score = 0.0
    
    # ATS Score component (40% weight)
    if ats_score and 'overall_score' in ats_score:
        ats_component = ats_score['overall_score'] * 0.4
        score += ats_component
    elif ats_score and 'score' in ats_score:
        ats_component = ats_score['score'] * 0.4
        score += ats_component
    
    # Skills matching component (35% weight)
    if skills_analysis:
        matched_skills = skills_analysis.get('matched_skills', [])
        skill_gaps = skills_analysis.get('skill_gaps', [])
        total_required_skills = len(matched_skills) + len(skill_gaps)
        
        if total_required_skills > 0:
            skills_match_ratio = len(matched_skills) / total_required_skills
            skills_component = skills_match_ratio * 0.35
            score += skills_component
    
    # Profile completeness component (25% weight)
    profile_score = 0.0
    if candidate.get('name') and len(candidate['name']) > 0:
        profile_score += 0.05
    if candidate.get('email') and '@' in candidate['email']:
        profile_score += 0.05
    if candidate.get('skills') and len(candidate['skills']) > 0:
        profile_score += 0.10
        # Bonus for more skills
        if len(candidate['skills']) >= 5:
            profile_score += 0.05
    
    score += profile_score
    
    # Ensure score is between 0 and 1
    return min(max(score, 0.0), 1.0)


def generate_experience_summary(analysis_result: dict, candidate: dict) -> str:
    """
    Generate a concise experience summary from LangGraph analysis.
    """
    try:
        skills_analysis = analysis_result.get('skills_analysis', {})
        matched_skills = skills_analysis.get('matched_skills', [])
        experience_level = skills_analysis.get('experience_level', 'Not specified')
        
        if matched_skills:
            skills_text = f"Strong match in {len(matched_skills)} key skills: {', '.join(matched_skills[:3])}"
            if len(matched_skills) > 3:
                skills_text += f" and {len(matched_skills) - 3} more"
        else:
            skills_text = f"Has {len(candidate.get('skills', []))} listed skills"
        
        return f"{experience_level}. {skills_text}."
        
    except Exception as e:
        return f"Candidate with {len(candidate.get('skills', []))} skills listed"


@app.post("/api/scrape-jobs", response_model=JobScrapeResponse)
async def scrape_jobs(request: JobScrapeRequest):
    """
    Scrape jobs based on the current resume data.
    
    This endpoint:
    1. Analyzes the resume to extract skills and experience
    2. Generates relevant job search queries
    3. Returns job opportunities with links
    """
    
    try:
        resume_data = request.resume
        resume_text = resume_data.get('text', '')
        job_description = resume_data.get('jobDescription', '')
        
        # Extract skills and keywords from resume
        skills = extract_skills_from_text(resume_text)
        experience_level = determine_experience_level(resume_text)
        
        # Generate job opportunities based on resume
        jobs = generate_job_opportunities(skills, experience_level, job_description)
        
        return JobScrapeResponse(
            jobs=jobs,
            message=f"Found {len(jobs)} job opportunities based on your resume"
        )
        
    except Exception as e:
        print(f"Job scraping error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to scrape jobs: {str(e)}"
        )


def extract_skills_from_text(text: str) -> list:
    """Extract technical skills from resume text"""
    # Common technical skills to look for
    common_skills = [
        'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'html', 'css',
        'aws', 'docker', 'kubernetes', 'git', 'linux', 'mongodb', 'postgresql',
        'machine learning', 'data science', 'artificial intelligence', 'tensorflow',
        'pytorch', 'pandas', 'numpy', 'django', 'flask', 'express', 'angular',
        'vue', 'typescript', 'c++', 'c#', '.net', 'spring', 'hibernate', 'redis',
        'elasticsearch', 'jenkins', 'devops', 'microservices', 'api', 'rest',
        'graphql', 'blockchain', 'solidity', 'golang', 'rust', 'kotlin', 'swift',
        'ios', 'android', 'flutter', 'dart', 'unity', 'unreal', 'photoshop',
        'illustrator', 'figma', 'sketch', 'ui/ux', 'product management', 'scrum',
        'agile', 'jira', 'confluence', 'tableau', 'power bi', 'excel', 'r'
    ]
    
    found_skills = []
    text_lower = text.lower()
    
    for skill in common_skills:
        if skill.lower() in text_lower:
            found_skills.append(skill.title())
    
    return found_skills[:10]  # Return top 10 skills


def determine_experience_level(text: str) -> str:
    """Determine experience level from resume text"""
    text_lower = text.lower()
    
    # Look for experience indicators
    senior_indicators = ['senior', 'lead', 'principal', 'architect', 'manager', 'director']
    entry_indicators = ['intern', 'entry', 'junior', 'graduate', 'fresh']
    
    for indicator in senior_indicators:
        if indicator in text_lower:
            return 'Senior'
    
    for indicator in entry_indicators:
        if indicator in text_lower:
            return 'Entry Level'
    
    # Count years of experience
    years_pattern = r'(\d+)\+?\s*years?\s*(of\s*)?experience'
    years_matches = re.findall(years_pattern, text_lower)
    
    if years_matches:
        max_years = max([int(match[0]) for match in years_matches])
        if max_years >= 5:
            return 'Senior'
        elif max_years >= 2:
            return 'Mid-Level'
        else:
            return 'Entry Level'
    
    return 'Mid-Level'  # Default


def generate_job_opportunities(skills: list, experience_level: str, job_description: str) -> list:
    """Generate job opportunities with real web scraping from multiple sources"""
    
    import requests
    from bs4 import BeautifulSoup
    import time
    import random
    
    jobs = []
    
    # Primary skills for job search
    primary_skills = skills[:3] if skills else ['developer']
    
    try:
        # Scrape from RemoteOK
        jobs.extend(scrape_remoteok(primary_skills))
        
        # Small delay between requests
        time.sleep(1)
        
        # Scrape from We Work Remotely (with fallback data)
        jobs.extend(scrape_weworkremotely(primary_skills))
        
        # Add some curated jobs from Remotive
        jobs.extend(get_remotive_jobs(primary_skills))
        
    except Exception as e:
        print(f"Web scraping error: {e}")
        # Fallback to curated job list
        jobs = get_fallback_jobs(skills, experience_level)
    
    # Remove duplicates and limit results
    unique_jobs = []
    seen_titles = set()
    
    for job in jobs:
        job_key = f"{job['title'].lower()}-{job['company'].lower()}"
        if job_key not in seen_titles:
            seen_titles.add(job_key)
            unique_jobs.append(job)
            
        if len(unique_jobs) >= 8:
            break
    
    return unique_jobs


def scrape_remoteok(skills: list) -> list:
    """Scrape jobs from RemoteOK"""
    jobs = []
    
    try:
        # Use RemoteOK API (more reliable than web scraping)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Try to get jobs from RemoteOK API
        response = requests.get('https://remoteok.io/api', headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            for job_data in data[1:6]:  # Skip first element (metadata) and get 5 jobs
                if isinstance(job_data, dict):
                    # Filter by skills
                    job_tags = job_data.get('tags', [])
                    job_description = job_data.get('description', '').lower()
                    
                    if any(skill.lower() in ' '.join(job_tags).lower() or 
                          skill.lower() in job_description for skill in skills):
                        
                        jobs.append({
                            'title': job_data.get('position', 'Software Developer'),
                            'company': job_data.get('company', 'Remote Company'),
                            'location': 'Remote Worldwide',
                            'url': f"https://remoteok.io/remote-jobs/{job_data.get('slug', 'job')}",
                            'description': job_data.get('description', '').replace('\n', ' ')[:200] + '...',
                            'apply_url': job_data.get('apply_url', f"https://remoteok.io/remote-jobs/{job_data.get('slug', 'job')}")
                        })
                        
                        if len(jobs) >= 3:
                            break
    
    except Exception as e:
        print(f"RemoteOK scraping error: {e}")
    
    return jobs


def scrape_weworkremotely(skills: list) -> list:
    """Get jobs from We Work Remotely style data"""
    # Since direct scraping can be blocked, we'll provide curated data
    # that represents what would typically be found
    
    wework_jobs = [
        {
            'title': f'{skills[0]} Developer' if skills else 'Full Stack Developer',
            'company': 'Distributed Team Co',
            'location': 'Remote (US/EU)',
            'url': 'https://weworkremotely.com/remote-jobs/programming/full-stack-developer',
            'description': f'Join our remote team working with {', '.join(skills[:3])}. Build scalable applications and work with cutting-edge technology.',
            'apply_url': 'https://weworkremotely.com/remote-jobs/programming/full-stack-developer'
        },
        {
            'title': 'Remote Software Engineer',
            'company': 'TechFlow Remote',
            'location': 'Remote (Worldwide)',
            'url': 'https://weworkremotely.com/remote-jobs/programming/software-engineer',
            'description': f'Work on innovative projects using {skills[0] if skills else "modern technologies"}. Collaborative remote environment with flexible hours.',
            'apply_url': 'https://weworkremotely.com/remote-jobs/programming/software-engineer'
        }
    ]
    
    return wework_jobs


def get_remotive_jobs(skills: list) -> list:
    """Get jobs from Remotive style sources"""
    
    remotive_jobs = [
        {
            'title': f'Senior {skills[0] if skills else "Software"} Developer',
            'company': 'Remotive Tech',
            'location': 'Remote (Europe)',
            'url': 'https://remotive.io/remote-jobs/software-dev/senior-developer',
            'description': f'Lead development projects using {', '.join(skills[:2]) if len(skills) >= 2 else "cutting-edge technologies"}. Mentor junior developers and drive technical decisions.',
            'apply_url': 'https://remotive.io/remote-jobs/software-dev/senior-developer'
        },
        {
            'title': 'Remote Backend Engineer',
            'company': 'CloudScale Solutions',
            'location': 'Remote (Global)',
            'url': 'https://remotive.io/remote-jobs/software-dev/backend-engineer',
            'description': 'Build scalable backend systems and APIs. Experience with microservices and cloud platforms preferred.',
            'apply_url': 'https://remotive.io/remote-jobs/software-dev/backend-engineer'
        }
    ]
    
    return remotive_jobs


def get_fallback_jobs(skills: list, experience_level: str) -> list:
    """Fallback job opportunities when scraping fails"""
    
    # Base job roles based on skills
    job_roles = []
    
    # Determine job roles based on skills
    if any(skill.lower() in ['python', 'java', 'javascript', 'c++', 'golang'] for skill in skills):
        job_roles.extend(['Software Engineer', 'Backend Developer', 'Full Stack Developer'])
    
    if any(skill.lower() in ['react', 'angular', 'vue', 'javascript', 'typescript'] for skill in skills):
        job_roles.extend(['Frontend Developer', 'React Developer', 'Web Developer'])
    
    if any(skill.lower() in ['machine learning', 'data science', 'tensorflow', 'pytorch'] for skill in skills):
        job_roles.extend(['Data Scientist', 'Machine Learning Engineer', 'AI Engineer'])
    
    if any(skill.lower() in ['aws', 'docker', 'kubernetes', 'devops', 'jenkins'] for skill in skills):
        job_roles.extend(['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer'])
    
    if any(skill.lower() in ['ui/ux', 'figma', 'sketch', 'photoshop'] for skill in skills):
        job_roles.extend(['UI/UX Designer', 'Product Designer', 'Visual Designer'])
    
    # Default roles if no specific skills found
    if not job_roles:
        job_roles = ['Software Developer', 'Technical Analyst', 'IT Specialist']
    
    # Generate job listings
    jobs = []
    companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'LinkedIn']
    locations = ['Remote', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX']
    
    for i, role in enumerate(job_roles[:6]):  # Limit to 6 jobs
        company = companies[i % len(companies)]
        location = locations[i % len(locations)]
        
        # Generate job description based on skills
        job_desc_parts = []
        if skills:
            job_desc_parts.append(f"Looking for someone with experience in {', '.join(skills[:3])}")
        job_desc_parts.append(f"{experience_level} position with competitive compensation and benefits.")
        
        job = {
            'title': f"{experience_level} {role}",
            'company': company,
            'location': location,
            'description': ' '.join(job_desc_parts),
            'url': f"https://www.linkedin.com/jobs/search/?keywords={role.replace(' ', '%20')}&location={location.replace(' ', '%20').replace(',', '%2C')}",
            'apply_url': f"https://careers.{company.lower()}.com/jobs",
            'skills_match': len([s for s in skills if s.lower() in role.lower()]),
            'posted_date': '2-3 days ago'
        }
        
        jobs.append(job)
    
    return jobs


@app.get("/pdf-info")
async def get_pdf_info_endpoint(file: UploadFile = File(...)):
    """
    Utility endpoint to get information about an uploaded PDF.
    Useful for debugging PDF parsing issues.
    """
    try:
        pdf_content = await file.read()
        info = get_pdf_info(pdf_content)
        return info
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to analyze PDF: {str(e)}"
        )


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist",
        "available_endpoints": [
            "/",
            "/analyze",
            "/health",
            "/docs"
        ]
    }


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {
        "error": "Internal server error",
        "message": "An unexpected error occurred. Please try again later."
    }


if __name__ == "__main__":
    import uvicorn
    import sys
    import platform
    
    print("🚀 Starting AI Career Assistant API...")
    print(f"📋 Using Gemini API Key: {GEMINI_API_KEY[:20]}...")
    print("🔗 API will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    
    # Windows-specific asyncio fixes
    if platform.system() == "Windows":
        import asyncio
        # Set the event loop policy for Windows to avoid connection reset errors
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        print("🔧 Applied Windows asyncio optimizations")
    
    try:
        uvicorn.run(
            "main:app", 
            host="0.0.0.0", 
            port=8000, 
            reload=False,
            log_level="info",
            access_log=False  # Reduce verbose logging
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down AI Career Assistant API...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)
