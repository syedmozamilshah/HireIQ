import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, X, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const GeneratedResumeModal = ({ isOpen, onClose, resumeData }) => {
    // Utility function to clean AI-generated content
    const cleanAIContent = (content) => {
        if (!content) return '';
        return content
            .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // Remove bold markdown
            .replace(/#{1,6}\s*/g, '') // Remove headers
            .replace(/\*\s*/g, '') // Remove asterisks
            .replace(/^\s*[-•]\s*/gm, '') // Remove bullet point markers for clean text
            .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
            .trim();
    };

    const formatListContent = (content) => {
        if (!content) return '';
        // For list items, we want to preserve structure but clean markdown
        return content
            .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // Remove bold markdown
            .replace(/#{1,6}\s*/g, '') // Remove headers
            .replace(/^\s*\*\s*/gm, '') // Remove leading asterisks for list formatting
            .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
            .trim();
    };

    const downloadAsPDF = () => {
        const element = document.getElementById('generated-resume');
        
        if (!element) {
            toast.error('Resume content not found');
            return;
        }

        // Use browser's print functionality as a more reliable alternative
        const printWindow = window.open('', '_blank');
        const resumeHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume - ${personalInfo.name}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.4;
                        color: #333;
                        background: white;
                        font-size: 11px;
                    }
                    .resume-container {
                        max-width: 8.5in;
                        margin: 0 auto;
                        padding: 0.5in;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #2563eb;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .name {
                        font-size: 22px;
                        font-weight: bold;
                        color: #1f2937;
                        margin-bottom: 8px;
                    }
                    .contact-info {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        flex-wrap: wrap;
                        font-size: 10px;
                        color: #6b7280;
                    }
                    .section {
                        margin-bottom: 18px;
                    }
                    .section-title {
                        font-size: 14px;
                        font-weight: bold;
                        color: #1f2937;
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 3px;
                        margin-bottom: 8px;
                    }
                    .job, .education-item, .project {
                        margin-bottom: 12px;
                    }
                    .job-header, .education-header, .project-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 4px;
                    }
                    .job-title, .degree, .project-name {
                        font-weight: bold;
                        font-size: 12px;
                        color: #1f2937;
                    }
                    .company, .institution {
                        color: #2563eb;
                        font-weight: 500;
                        font-size: 11px;
                    }
                    .date, .location {
                        font-size: 10px;
                        color: #6b7280;
                        text-align: right;
                    }
                    .description {
                        margin-top: 4px;
                        font-size: 10px;
                        line-height: 1.3;
                    }
                    .skills-container {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 6px;
                    }
                    .skill {
                        background: #f3f4f6;
                        color: #374151;
                        padding: 3px 8px;
                        border-radius: 12px;
                        font-size: 9px;
                        font-weight: 500;
                    }
                    .tech {
                        background: #e0e7ff;
                        color: #3730a3;
                        padding: 2px 6px;
                        border-radius: 8px;
                        font-size: 8px;
                        margin-right: 4px;
                        margin-bottom: 2px;
                        display: inline-block;
                    }
                    @media print {
                        body { print-color-adjust: exact; }
                        .resume-container { padding: 0.3in; }
                    }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
            </html>
        `;
        
        printWindow.document.write(resumeHTML);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
            printWindow.print();
            toast.success('Resume ready for download! Use your browser\'s print dialog to save as PDF.');
        }, 500);
    };

    if (!resumeData) {
        console.log('GeneratedResumeModal: No resume data provided');
        return null;
    }

    // Debug logging
    console.log('GeneratedResumeModal received data:', resumeData);

    // Map the backend data structure to the expected format
    const personalInfo = {
        name: `${resumeData.firstName || ''} ${resumeData.lastName || ''}`.trim() || 'Your Name',
        email: resumeData.email || '',
        phone: resumeData.phone || '',
        location: resumeData.address || '',
        linkedin: resumeData.linkedin || ''
    };
    
    const summary = resumeData.summary || '';
    const workExperience = resumeData.Experience || resumeData.experience || [];
    const education = resumeData.education || [];
    const skills = resumeData.skills || [];
    const projects = resumeData.projects || [];
    const certifications = resumeData.certifications || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center justify-between">
                        <span>Generated Resume</span>
                        <div className="flex gap-2">
                            <Button
                                onClick={downloadAsPDF}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {/* Resume Preview */}
                <div id="generated-resume" className="bg-white p-6 space-y-5 border rounded-lg shadow-sm max-w-full overflow-hidden">
                    {/* Header */}
                    <div className="text-center border-b pb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {personalInfo.name || 'Your Name'}
                        </h1>
                        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600">
                            {personalInfo.email && (
                                <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {personalInfo.email}
                                </div>
                            )}
                            {personalInfo.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {personalInfo.phone}
                                </div>
                            )}
                            {personalInfo.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {personalInfo.location}
                                </div>
                            )}
                            {personalInfo.linkedin && (
                                <div className="flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" />
                                    LinkedIn
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Professional Summary */}
                    {summary && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                                Professional Summary
                            </h2>
                            <p className="text-gray-700 leading-relaxed">{cleanAIContent(summary)}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                                Technical Skills
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                                        {typeof skill === 'object' ? skill.name : skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Work Experience */}
                    {workExperience.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                                Work Experience
                            </h2>
                            <div className="space-y-4">
                                {workExperience.map((job, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{job.title || job.position}</h3>
                                                <p className="text-blue-600 font-medium">{job.companyName || job.company}</p>
                                            </div>
                                            <div className="text-right text-xs text-gray-600">
                                                <p>{job.startDate && job.endDate ? `${job.startDate} - ${job.endDate}` : job.duration}</p>
                                                {(job.city && job.state) ? <p>{job.city}, {job.state}</p> : job.location && <p>{job.location}</p>}
                                            </div>
                                        </div>
                                        {(job.workSummery || job.responsibilities) && (
                                            <div className="text-gray-700 mt-2">
                                                {job.workSummery ? (
                                                    <div dangerouslySetInnerHTML={{ __html: job.workSummery }} />
                                                ) : (
                                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                                        {job.responsibilities.map((resp, respIndex) => (
                                                            <li key={respIndex}>{formatListContent(resp)}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                                Projects
                            </h2>
                            <div className="space-y-4">
                                {projects.map((project, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                            {project.duration && (
                                                <span className="text-sm text-gray-600">{project.duration}</span>
                                            )}
                                        </div>
                                        {project.description && (
                                            <p className="text-gray-700">{cleanAIContent(project.description)}</p>
                                        )}
                                        {project.technologies && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {project.technologies.map((tech, techIndex) => (
                                                    <Badge key={techIndex} variant="outline" className="text-xs px-2 py-0.5">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                                Education
                            </h2>
                            <div className="space-y-3">
                                {education.map((edu, index) => (
                                    <div key={index} className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                                            <p className="text-blue-600">{edu.institution}</p>
                                            {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                                        </div>
                                        <div className="text-right text-sm text-gray-600">
                                            <p>{edu.endDate || edu.year || edu.graduationYear}</p>
                                            {edu.location && <p>{edu.location}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                                Certifications
                            </h2>
                            <div className="space-y-2">
                                {certifications.map((cert, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                                            <p className="text-blue-600">{cert.issuer}</p>
                                        </div>
                                        {cert.date && (
                                            <span className="text-sm text-gray-600">{cert.date}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GeneratedResumeModal;
