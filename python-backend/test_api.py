"""
Test script to verify API functionality
"""

import requests
import json
import time
from pathlib import Path

# API configuration
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed:", response.json())
        else:
            print("❌ Health check failed:", response.status_code)
    except Exception as e:
        print("❌ Health check error:", str(e))

def create_test_resume():
    """Create a test resume PDF"""
    print("\nCreating test resume...")
    
    # Simple test resume content
    resume_content = """
    John Doe
    Software Developer
    john.doe@email.com | +1-234-567-8900
    
    PROFESSIONAL SUMMARY
    Experienced Software Developer with 5 years of experience in full-stack web development.
    Proficient in Python, JavaScript, React, and Node.js. Strong background in building
    scalable web applications and RESTful APIs.
    
    TECHNICAL SKILLS
    Programming Languages: Python, JavaScript, Java, SQL
    Frontend: React, Vue.js, HTML5, CSS3, Bootstrap
    Backend: Node.js, Express.js, Django, Flask
    Databases: PostgreSQL, MongoDB, Redis
    Cloud & DevOps: AWS, Docker, CI/CD, Git
    
    PROFESSIONAL EXPERIENCE
    
    Senior Software Developer | TechCorp Inc. | 2021 - Present
    - Developed and maintained microservices architecture using Node.js and Python
    - Led a team of 4 developers in building a customer portal using React
    - Implemented CI/CD pipelines using Jenkins and Docker
    - Optimized database queries resulting in 40% performance improvement
    
    Software Developer | WebSolutions Ltd. | 2019 - 2021
    - Built RESTful APIs using Django and Flask frameworks
    - Created responsive web applications using React and Redux
    - Managed PostgreSQL and MongoDB databases
    - Collaborated with cross-functional teams using Agile methodology
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Technology | 2015 - 2019
    
    CERTIFICATIONS
    - AWS Certified Developer - Associate
    - MongoDB Certified Developer
    
    PROJECTS
    E-commerce Platform: Built a full-stack e-commerce platform using MERN stack
    Task Management System: Developed a project management tool using Django and React
    """
    
    # For testing, we'll save it as a text file and read it
    # In real scenario, this would be a PDF
    test_file = Path("test_resume.txt")
    test_file.write_text(resume_content)
    return test_file

def test_analyze_endpoint():
    """Test the main analyze endpoint"""
    print("\nTesting analyze endpoint...")
    
    # Create test resume file
    resume_file = create_test_resume()
    
    # Test job description
    job_description = """
    We are looking for a talented Full Stack Developer to join our team.
    
    Requirements:
    - 3+ years of experience in web development
    - Strong proficiency in React.js and Node.js
    - Experience with TypeScript and modern JavaScript (ES6+)
    - Knowledge of MongoDB and PostgreSQL databases
    - Experience with AWS services (EC2, S3, Lambda)
    - Familiarity with Docker and Kubernetes
    - Understanding of microservices architecture
    - Experience with GraphQL is a plus
    - Knowledge of testing frameworks (Jest, Mocha)
    - Excellent problem-solving skills
    - Strong communication skills
    
    Responsibilities:
    - Design and develop scalable web applications
    - Build RESTful APIs and GraphQL endpoints
    - Implement responsive user interfaces
    - Write clean, maintainable code
    - Participate in code reviews
    - Collaborate with cross-functional teams
    """
    
    try:
        # Since we're using a text file for testing, we'll read its content
        with open(resume_file, 'rb') as f:
            resume_content = f.read()
        
        # Create a simple PDF-like file for testing
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        import io
        
        # Create PDF in memory
        pdf_buffer = io.BytesIO()
        c = canvas.Canvas(pdf_buffer, pagesize=letter)
        
        # Add resume content to PDF
        y_position = 750
        for line in resume_file.read_text().split('\n'):
            if line.strip():
                c.drawString(50, y_position, line.strip())
                y_position -= 15
                if y_position < 50:
                    c.showPage()
                    y_position = 750
        
        c.save()
        pdf_buffer.seek(0)
        
        # Prepare the request
        files = {
            'resume': ('test_resume.pdf', pdf_buffer, 'application/pdf')
        }
        data = {
            'job_description': job_description
        }
        
        print("Sending request to API...")
        response = requests.post(f"{BASE_URL}/analyze", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ API Test Successful!")
            print("\n📊 Results Summary:")
            print(f"- ATS Score: {result['ats_score']['score']}")
            print(f"- Buzzword Repetitions: {result['skills_analysis']['keyword_repetitions']['status']}")
            print(f"- Missing Skills: {len(result['skills_analysis']['missing_skills'])}")
            print(f"- Learning Resources: {len(result['resources'])} skills covered")
            print(f"- Projects Suggested: {len(result['projects'])}")
            print(f"- Jobs Found: {len(result['jobs'])}")
            print(f"- Interview Questions: {len(result['interview_questions'])}")
            
            # Save full results
            with open('test_results.json', 'w') as f:
                json.dump(result, f, indent=2)
            print("\n📄 Full results saved to test_results.json")
            
        else:
            print(f"❌ API request failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except ImportError:
        print("⚠️  ReportLab not installed. Testing with plain text file simulation...")
        # Fallback test without PDF
        
        # Read the text file content
        with open(resume_file, 'r') as f:
            resume_text = f.read()
        
        # For testing purposes, we'll simulate the PDF parsing output
        print("Note: This is a simulation test without actual PDF upload")
        
    except Exception as e:
        print(f"❌ Test error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Cleanup
        if resume_file.exists():
            resume_file.unlink()

def main():
    """Run all tests"""
    print("🧪 Starting API tests...\n")
    
    # Test health endpoint
    test_health()
    
    # Wait a moment for server to be ready
    time.sleep(1)
    
    # Test main analyze endpoint
    # Note: This requires the server to be running
    print("\n⚠️  Note: Make sure the API server is running on http://localhost:8000")
    print("You can start it with: python main.py")
    
if __name__ == "__main__":
    main()
