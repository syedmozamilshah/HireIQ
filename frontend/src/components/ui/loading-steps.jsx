import React from 'react';
import { Brain, Loader2 } from 'lucide-react';

const LoadingSteps = ({ 
    title = "Processing...", 
    subtitle = "Please wait while we process your request", 
    steps = [], 
    currentStep = 0,
    estimatedTime = "30-60 seconds",
    showBrainIcon = true,
    className = ""
}) => {
    const defaultSteps = [
        "Reading Resume Content",
        "Extracting Skills & Experience", 
        "Comparing to Job Description",
        "Calculating ATS Score",
        "Generating Recommendations"
    ];

    const displaySteps = steps.length > 0 ? steps : defaultSteps;

    return (
        <div className={`flex flex-col items-center justify-center py-16 space-y-6 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 ${className}`}>
            {/* Animated Icon */}
            <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    {showBrainIcon ? (
                        <Brain className="h-8 w-8 text-blue-500" />
                    ) : (
                        <Loader2 className="h-8 w-8 text-blue-500" />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-600 max-w-md">{subtitle}</p>
                
                {/* Enhanced step indicators */}
                <div className="space-y-3 text-sm text-gray-600 max-w-sm mx-auto">
                    {displaySteps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        
                        return (
                            <div key={index} className="flex items-center justify-start gap-3 p-2 bg-white rounded-lg shadow-sm">
                                <div 
                                    className={`w-3 h-3 rounded-full ${
                                        isCompleted 
                                            ? 'bg-green-500' 
                                            : isActive 
                                                ? 'bg-blue-500 animate-pulse' 
                                                : 'bg-gray-300'
                                    }`}
                                    style={isActive ? {animationDelay: `${index * 0.2}s`} : {}}
                                ></div>
                                <span className={`flex-1 text-left ${
                                    isCompleted ? 'text-green-700 font-medium' :
                                    isActive ? 'text-blue-700 font-medium' : 'text-gray-500'
                                }`}>
                                    {step}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${
                                    isCompleted 
                                        ? 'bg-green-500' 
                                        : isActive 
                                            ? 'bg-yellow-500 animate-pulse' 
                                            : 'bg-gray-300'
                                }`}></div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mt-6">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{width: `${Math.min((currentStep / displaySteps.length) * 100 + 20, 90)}%`}}
                    ></div>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">This usually takes {estimatedTime}...</p>
            </div>
        </div>
    );
};

// Specific loading components for different use cases
export const ResumeAnalysisLoading = ({ currentStep = 0 }) => (
    <LoadingSteps
        title="Analyzing your resume..."
        subtitle="AI is processing your resume and comparing it with the job requirements"
        steps={[
            "Reading Resume Content",
            "Extracting Skills & Experience", 
            "Comparing to Job Description",
            "Calculating ATS Score",
            "Generating Recommendations"
        ]}
        currentStep={currentStep}
        estimatedTime="30-60 seconds"
        showBrainIcon={true}
    />
);

export const ResumeGenerationLoading = ({ currentStep = 0 }) => (
    <LoadingSteps
        title="Generating optimized resume..."
        subtitle="Creating a tailored resume based on your analysis results"
        steps={[
            "Analyzing Job Requirements",
            "Optimizing Content Structure",
            "Enhancing Keywords",
            "Formatting Document",
            "Finalizing Resume"
        ]}
        currentStep={currentStep}
        estimatedTime="20-30 seconds"
        showBrainIcon={false}
    />
);

export default LoadingSteps;
