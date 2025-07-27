"""
Simple manual test of the career assistant functionality
"""

import asyncio
import os
import json
from dotenv import load_dotenv
from career_agent import CareerAssistantAgent

# Load environment variables
load_dotenv()

async def test_career_agent():
    """Test the career agent directly without API"""
    
    # Sample resume text
    resume_text = """
    John Smith
    Full Stack Developer
    john.smith@email.com | (555) 123-4567
    
    SUMMARY
    Experienced Full Stack Developer with 5 years building web applications.
    Skilled in Python, JavaScript, React, and Node.js.
    
    TECHNICAL SKILLS
    - Programming: Python, JavaScript, Java, SQL
    - Frontend: React, HTML5, CSS3, Bootstrap
    - Backend: Node.js, Django, Flask, Express
    - Databases: PostgreSQL, MongoDB, MySQL
    - Tools: Git, Docker, AWS, Jenkins
    
    EXPERIENCE
    Senior Developer | Tech Corp | 2020-Present
    - Built microservices using Node.js and Python
    - Led team of 4 developers on React projects
    - Implemented CI/CD pipelines with Docker
    
    Developer | Web Solutions | 2018-2020
    - Developed REST APIs with Django
    - Created responsive UIs with React
    - Managed PostgreSQL databases
    
    EDUCATION
    BS Computer Science | State University | 2018
    
    CERTIFICATIONS
    - AWS Certified Developer
    """
    
    # Sample job description
    job_description = """
    We are seeking a Full Stack Developer to join our team.
    
    Requirements:
    - 3+ years experience in web development
    - Strong skills in React and TypeScript
    - Experience with Node.js and GraphQL
    - Knowledge of Kubernetes and microservices
    - Familiarity with AWS Lambda and serverless
    - Experience with testing (Jest, Cypress)
    - Understanding of CI/CD and DevOps practices
    
    Nice to have:
    - Next.js experience
    - Redis and caching strategies
    - Machine learning basics
    """
    
    print("🧪 Testing Career Assistant Agent...\n")
    
    try:
        # Initialize agent
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("❌ Error: GEMINI_API_KEY not found in environment")
            return
            
        agent = CareerAssistantAgent(api_key)
        
        # Run analysis
        print("📊 Running analysis...")
        result = await agent.analyze(resume_text, job_description)
        
        # Display results
        print("\n✅ Analysis Complete!\n")
        
        # ATS Score
        ats = result['ats_score']
        print(f"📈 ATS Score: {ats['score']}/100")
        print(f"   Feedback: {ats['feedback']}")
        print("\n   Score Breakdown:")
        for key, value in ats['breakdown'].items():
            print(f"   - {key}: {value}")
        
        # Missing Skills
        print(f"\n🔍 Missing Skills: {', '.join(result['skills_analysis']['missing_skills'][:5])}")
        print(f"   Buzzword Repetitions: {result['skills_analysis']['keyword_repetitions']['status']}")
        
        # Learning Roadmap
        roadmap = result.get('learning_roadmap', {}).get('roadmap', [])
        if roadmap:
            print(f"\n📚 Learning Roadmap ({len(roadmap)} skills):")
            for item in roadmap[:3]:  # Show first 3
                print(f"   {item['order']}. {item['skill']} - {item['time']}")
        
        # Resources
        resources = result.get('resources', {})
        print(f"\n📖 Learning Resources for {len(resources)} skills")
        
        # Projects
        projects = result.get('projects', [])
        print(f"\n💼 {len(projects)} Project Suggestions")
        if projects:
            print(f"   Example: {projects[0]['title']}")
        
        # Jobs
        jobs = result.get('jobs', [])
        print(f"\n💻 {len(jobs)} Job Matches")
        
        # Interview Questions
        questions = result.get('interview_questions', [])
        print(f"\n❓ {len(questions)} Interview Questions")
        
        # Errors
        errors = result.get('errors', [])
        if errors:
            print(f"\n⚠️  Errors: {errors}")
        
        # Save full results
        with open('test_output.json', 'w') as f:
            json.dump(result, f, indent=2)
        print("\n💾 Full results saved to test_output.json")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_career_agent())
