import React from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Lock, ArrowRight, Sparkles, Shield, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginPrompt = ({ 
  title = "Login Required", 
  description = "Please log in to access this feature", 
  features = [], 
  showFeatures = true,
  className = "" 
}) => {
  const defaultFeatures = [
    { icon: Shield, text: "Secure and private account" },
    { icon: UserCheck, text: "Personalized job recommendations" },
    { icon: Sparkles, text: "AI-powered career insights" }
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <div className={`min-h-[60vh] flex items-center justify-center px-4 ${className}`}>
      <Card className="max-w-lg w-full border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-2xl backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          {/* Lock Icon with Gradient Background */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>

          {/* Main Content */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Features List */}
          {showFeatures && (
            <div className="mb-8 space-y-4">
              {displayFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 shadow-lg transform hover:scale-105 transition-all duration-200">
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/signup" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-semibold py-3 transition-all duration-200"
              >
                Create Account
              </Button>
            </Link>
          </div>

          {/* Footer Message */}
          <div className="mt-6 text-sm text-gray-500">
            Join thousands of professionals using HireWirey
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPrompt;
