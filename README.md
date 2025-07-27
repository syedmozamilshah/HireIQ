# 🚀 Hirey-Wirey - AI-Powered Job Portal & Recruitment Platform

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-yellow.svg)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A modern, full-stack job portal with AI-powered resume analysis, candidate ranking, and recruitment tools. Built with React, Node.js, Python, and integrated with LangGraph for intelligent career assistance.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [AI Features](#-ai-features)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 For Job Seekers
- **Smart Job Search**: Find jobs matching your skills and experience
- **AI Resume Analysis**: Get detailed feedback on your resume
- **ATS-Optimized Resume Generation**: Create recruiter-friendly resumes
- **Career Guidance**: Personalized learning paths and skill recommendations
- **Application Tracking**: Monitor your job applications in real-time
- **Profile Management**: Comprehensive profile with skills, experience, and portfolio

### 🏢 For Recruiters
- **Job Posting Management**: Create and manage job listings
- **AI Candidate Analysis**: Intelligent ranking of applicants using LangGraph
- **Top Candidates Modal**: View top 5 matching candidates with detailed analysis
- **Resume Preview**: In-app resume viewing with download options
- **Company Management**: Manage multiple company profiles
- **Analytics Dashboard**: Track job performance and candidate metrics

### 🤖 AI-Powered Features
- **LangGraph Integration**: Advanced AI workflows for resume analysis
- **Skills Matching**: AI-driven candidate-job compatibility scoring
- **Resume Optimization**: Automatic resume enhancement for better ATS scores
- **Career Recommendations**: Personalized career guidance and learning paths
- **Interview Preparation**: AI-generated interview questions and tips

## 🛠 Tech Stack

### Frontend
- **React 18.x** - Modern UI library with hooks
- **Redux Toolkit** - State management with Redux Persist
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern React component library
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload middleware
- **Cookie Parser** - Cookie parsing middleware
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development server auto-restart

### AI Backend
- **Python 3.9+** - AI processing engine
- **FastAPI** - Modern Python web framework
- **LangGraph** - Advanced AI workflow orchestration
- **Google Gemini** - Large Language Model integration
- **PDF Processing** - Resume text extraction and analysis
- **Machine Learning** - Candidate scoring and matching algorithms

### Database
- **MongoDB Atlas** - Cloud-hosted MongoDB database
- **Collections**: Users, Jobs, Applications, Companies
- **Indexing**: Optimized queries for better performance

## 📁 Project Structure

```
hirey-wirey/
├── backend/                 # Node.js Express server
│   ├── controllers/         # Route controllers
│   │   ├── application.controller.js
│   │   ├── career.controller.js
│   │   ├── company.controller.js
│   │   ├── job.controller.js
│   │   ├── resume.controller.js
│   │   └── user.controller.js
│   ├── models/             # MongoDB models
│   │   ├── application.model.js
│   │   ├── company.model.js
│   │   ├── job.model.js
│   │   └── user.model.js
│   ├── routes/             # API routes
│   │   ├── application.route.js
│   │   ├── company.route.js
│   │   ├── job.route.js
│   │   ├── resume.route.js
│   │   └── user.route.js
│   ├── middleware/         # Custom middleware
│   │   └── isAuthenticated.js
│   ├── utils/              # Utility functions
│   │   └── connection.js
│   ├── uploads/            # File upload storage
│   ├── package.json        # Dependencies and scripts
│   └── index.js           # Server entry point
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── admin/      # Recruiter dashboard components
│   │   │   │   ├── RecruiterDashboard.jsx
│   │   │   │   ├── TopCandidatesModal.jsx
│   │   │   │   ├── AdminJobs.jsx
│   │   │   │   ├── PostJob.jsx
│   │   │   │   └── ...
│   │   │   ├── auth/       # Authentication components
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── shared/     # Shared components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── ui/         # UI components (Shadcn)
│   │   │   │   ├── button.jsx
│   │   │   │   ├── dialog.jsx
│   │   │   │   ├── card.jsx
│   │   │   │   └── ...
│   │   │   ├── CareerAssistant.jsx
│   │   │   ├── GeneratedResumeModal.jsx
│   │   │   ├── ResumeAnalysisModal.jsx
│   │   │   └── ...
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useGetAllJobs.jsx
│   │   │   ├── useGetAllCompanies.jsx
│   │   │   └── ...
│   │   ├── redux/          # Redux store and slices
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   ├── jobSlice.js
│   │   │   └── ...
│   │   ├── utils/          # Utility functions
│   │   │   └── constant.jsx
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # React entry point
│   ├── public/             # Static assets
│   ├── package.json        # Dependencies and scripts
│   └── vite.config.js      # Vite configuration
│
├── python-backend/         # AI processing server
│   ├── career_agent.py     # LangGraph career assistant
│   ├── pdf_parser.py       # PDF processing utilities
│   ├── main.py            # FastAPI server
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
│
├── .gitignore             # Git ignore file
├── .gitattributes         # Git attributes
├── package.json           # Root package.json
└── README.md              # This file
```

## 🚀 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/syedmozamilshah/Hirey-Wirey.git
cd Hirey-Wirey
```

### 2. Install Dependencies

#### Backend Setup
```bash
cd backend
npm install
```

#### Frontend Setup
```bash
cd ../frontend
npm install
```

#### Python Backend Setup
```bash
cd ../python-backend
pip install -r requirements.txt
```

### 3. Environment Configuration

Create `.env` files in the respective directories:

#### Backend (.env)
```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/hirey-wirey
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hirey-wirey

JWT_SECRET_KEY=your-super-secret-jwt-key-here
NODE_ENV=development
```

#### Python Backend (.env)
```env
GEMINI_API_KEY=your-google-gemini-api-key-here
ENVIRONMENT=development
```

## ⚙️ Configuration

### MongoDB Setup
1. **Local MongoDB**: Install and start MongoDB locally
2. **MongoDB Atlas**: Create a cluster and get connection string

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your Python backend `.env` file

### File Upload Configuration
- Default upload directory: `backend/uploads/`
- Supported formats: PDF for resumes
- Maximum file size: 10MB

## 🎮 Usage

### Development Mode

#### Start All Services

1. **Start MongoDB** (if using local)
```bash
mongod
```

2. **Start Python Backend**
```bash
cd python-backend
python main.py
```
Server runs on: http://localhost:8000

3. **Start Node.js Backend**
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:8000

4. **Start Frontend**
```bash
cd frontend
npm run dev
```
Application runs on: http://localhost:5173

### Production Deployment

#### Backend Deployment
```bash
cd backend
npm start
```

#### Frontend Build
```bash
cd frontend
npm run build
```

#### Python Backend (Production)
```bash
cd python-backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/login` - User login
- `POST /api/v1/user/logout` - User logout
- `GET /api/v1/user/profile` - Get user profile
- `POST /api/v1/user/profile/update` - Update user profile

### Job Endpoints
- `GET /api/v1/job/get` - Get all jobs
- `GET /api/v1/job/getadminjobs` - Get recruiter's jobs
- `GET /api/v1/job/get/:id` - Get job by ID
- `POST /api/v1/job/post` - Create new job
- `PUT /api/v1/job/update/:id` - Update job

### Application Endpoints
- `GET /api/v1/application/get` - Get user's applications
- `GET /api/v1/application/:id/applicants` - Get job applicants
- `POST /api/v1/application/apply/:id` - Apply for job
- `POST /api/v1/application/status/:id/update` - Update application status

### Company Endpoints
- `GET /api/v1/company/get` - Get all companies
- `GET /api/v1/company/get/:id` - Get company by ID
- `POST /api/v1/company/register` - Register new company
- `PUT /api/v1/company/update/:id` - Update company

### Resume & AI Endpoints
- `POST /api/v1/resume/analyze` - Analyze resume against job
- `POST /api/v1/resume/generate` - Generate optimized resume
- `POST /api/v1/resume/analyze-candidates` - Analyze top candidates
- `GET /api/v1/resume/:userId` - Get user resume

### Python AI Endpoints
- `POST /analyze` - Resume analysis with LangGraph
- `POST /generate-resume` - ATS resume generation
- `POST /analyze-candidates` - Candidate ranking with AI
- `GET /health` - Health check

## 🤖 AI Features

### LangGraph Integration
The platform uses LangGraph for advanced AI workflows:

#### Resume Analysis Workflow
1. **PDF Processing**: Extract text from uploaded resumes
2. **Content Analysis**: Analyze skills, experience, and qualifications
3. **ATS Scoring**: Generate ATS compatibility scores
4. **Gap Analysis**: Identify missing skills and requirements
5. **Recommendations**: Provide improvement suggestions

#### Candidate Ranking Algorithm
1. **Resume Parsing**: Extract structured data from candidate resumes
2. **Skill Matching**: Compare candidate skills with job requirements
3. **Experience Evaluation**: Assess relevant work experience
4. **Cultural Fit**: Analyze soft skills and cultural alignment
5. **Composite Scoring**: Generate overall candidate scores

#### Resume Generation Process
1. **Analysis Integration**: Use existing resume analysis
2. **Content Optimization**: Restructure content for ATS systems
3. **Keyword Enhancement**: Optimize for job-specific keywords
4. **Format Standardization**: Apply ATS-friendly formatting
5. **Quality Assurance**: Validate generated content

### AI Models Used
- **Google Gemini Pro**: Primary LLM for text analysis
- **Custom Scoring Algorithms**: Proprietary candidate matching
- **PDF Processing Pipeline**: Advanced text extraction
- **Skills Taxonomy**: Comprehensive skills database

## 🔧 Development

### Code Structure Guidelines
- **Components**: Functional components with hooks
- **State Management**: Redux Toolkit with persistence
- **Styling**: Tailwind CSS with component variants
- **API Calls**: Centralized in custom hooks
- **Error Handling**: Consistent error boundaries

### Adding New Features
1. **Backend**: Add controller → route → test
2. **Frontend**: Add component → hook → integration
3. **AI**: Extend Python backend → update workflows

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Python backend tests
cd python-backend
pytest
```

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```bash
Error: MongoNetworkError: failed to connect to server
```
**Solution**: Check MongoDB service and connection string

#### Python Backend Not Starting
```bash
ModuleNotFoundError: No module named 'langchain'
```
**Solution**: Install Python dependencies
```bash
pip install -r requirements.txt
```

#### Frontend Build Failures
```bash
Module not found: Can't resolve '@/components/ui/...'
```
**Solution**: Check import paths and component exports

#### CORS Errors
```bash
Access to fetch blocked by CORS policy
```
**Solution**: Verify CORS configuration in backend

### Performance Optimization
- **Database Indexing**: Create indexes on frequently queried fields
- **Caching**: Implement Redis for session management
- **CDN**: Use CDN for static assets
- **Load Balancing**: Configure load balancer for production

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LangGraph** for AI workflow orchestration
- **Google Gemini** for language model capabilities
- **Shadcn/ui** for beautiful React components
- **Tailwind CSS** for utility-first styling
- **MongoDB** for flexible data storage

## 📞 Support

For support and questions:

- **Email**: syedmozamilshah99@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/syedmozamilshah/Hirey-Wirey/issues)
- **Documentation**: [Project Wiki](https://github.com/syedmozamilshah/Hirey-Wirey/wiki)

## 🎯 Roadmap

### Version 2.0 (Q2 2024)
- [ ] Video interview integration
- [ ] Advanced analytics dashboard
- [ ] Mobile application (React Native)
- [ ] Multi-language support
- [ ] Enhanced AI recommendations

### Version 3.0 (Q4 2024)
- [ ] Blockchain-based credentials
- [ ] AR/VR interview experiences
- [ ] Advanced skills assessments
- [ ] Global talent marketplace
- [ ] Enterprise SSO integration

---

**Made with ❤️ by Syed Mozamil Shah**

For more information, visit the [GitHub repository](https://github.com/syedmozamilshah/Hirey-Wirey) or connect with me on [GitHub](https://github.com/syedmozamilshah).
