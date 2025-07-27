import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import Category from './Category'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import LoginPrompt from './ui/login-prompt'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Users, TrendingUp } from 'lucide-react'

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, []);

  const homeFeatures = [
    { icon: Briefcase, text: "Access to 1000+ job opportunities" },
    { icon: Users, text: "Connect with top companies" },
    { icon: TrendingUp, text: "Track your application progress" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <HeroSection />
      {!user ? (
        <LoginPrompt 
          title="Join HireWirey Today"
          description="Unlock the full potential of our AI-powered job search platform. Get personalized recommendations and insights."
          features={homeFeatures}
          className="py-16"
        />
      ) : (
        <>
          <Category />
          <LatestJobs />
        </>
      )}
      <Footer />
    </div>
  )
}

export default Home
