import React from 'react';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Hirey Wirey
              </h2>
            </div>
            <p className="text-blue-200 mb-4 leading-relaxed">
              Revolutionizing job search with AI-powered resume analysis and personalized career guidance. 
              Connect with your dream job through intelligent matching and insights.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:syedmozamilshah99@gmail.com" className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">syedmozamilshah99@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-blue-200 hover:text-white transition-colors">Home</a></li>
              <li><a href="/jobs" className="text-blue-200 hover:text-white transition-colors">Browse Jobs</a></li>
              <li><a href="/browse" className="text-blue-200 hover:text-white transition-colors">Search</a></li>
              <li><a href="/signup" className="text-blue-200 hover:text-white transition-colors">Join Us</a></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Features</h3>
            <ul className="space-y-2">
              <li className="text-blue-200">AI Resume Analysis</li>
              <li className="text-blue-200">Career Guidance</li>
              <li className="text-blue-200">Job Matching</li>
              <li className="text-blue-200">Interview Prep</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 mt-8 pt-8 text-center">
          <p className="text-blue-300 text-sm">
            © 2025 Hirey Wirey. Built with ❤️ by Syed Mozamil Shah. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;