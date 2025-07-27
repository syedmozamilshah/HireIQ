import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, User2, Menu, X, Briefcase, Home, Search, Building, Brain } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant.jsx';
import { setUser } from '@/redux/authSlice';

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const NavLink = ({ to, children, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </Link>
    );
  };

  return (
    <nav className='bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50'>
      <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4'>
        {/* Logo */}
        <div className='flex items-center'>
          <Link to="/" className='flex items-center gap-2'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
              <Briefcase className='w-6 h-6 text-white' />
            </div>
            <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              HireWirey
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-2'>
          {user && user.role === 'recruiter' ? (
            <>
              <NavLink to="/admin/dashboard" icon={Building}>Dashboard</NavLink>
              <NavLink to="/admin/companies" icon={Building}>Companies</NavLink>
              <NavLink to="/admin/jobs" icon={Briefcase}>Jobs</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" icon={Home}>Home</NavLink>
              <NavLink to="/jobs" icon={Briefcase}>Jobs</NavLink>
              <NavLink to="/browse" icon={Search}>Browse</NavLink>
<NavLink to="/career-assistant" icon={Brain}>Analyzer</NavLink>
            </>
          )}
        </div>

        {/* Auth Section */}
        <div className='flex items-center gap-4'>
          {!user ? (
            <div className='flex items-center gap-3'>
              <Link to="/login">
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <div className='flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors'>
                  <Avatar className="w-10 h-10 ring-2 ring-blue-200">
                    <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                  </Avatar>
                  <div className='hidden sm:block text-left'>
                    <p className='font-medium text-gray-900'>{user?.fullname}</p>
                    <p className='text-sm text-gray-500 capitalize'>{user?.role}</p>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 border-0 shadow-xl rounded-xl">
                <div className='bg-white rounded-xl overflow-hidden'>
                  {/* Profile Header */}
                  <div className='bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white'>
                    <div className='flex gap-4'>
                      <Avatar className="w-16 h-16 ring-4 ring-white/20">
                        <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                      </Avatar>
                      <div>
                        <h4 className='font-semibold text-lg'>{user?.fullname}</h4>
                        <p className='text-blue-100 capitalize'>{user?.role}</p>
                        <p className='text-sm text-blue-100 mt-1'>{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className='p-4'>
                    {user && user.role === 'jobseeker' && (
                      <Link to="/profile" className='flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                        <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                          <User2 className='w-4 h-4 text-blue-600' />
                        </div>
                        <span className='font-medium text-gray-700'>View Profile</span>
                      </Link>
                    )}
                    <button 
                      onClick={logoutHandler}
                      className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left'
                    >
                      <div className='w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center'>
                        <LogOut className='w-4 h-4 text-red-600' />
                      </div>
                      <span className='font-medium text-red-600'>Logout</span>
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Mobile Menu Button */}
          <button
            className='md:hidden p-2 rounded-lg hover:bg-gray-100'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='md:hidden bg-white border-t border-gray-200 p-4'>
          <div className='flex flex-col gap-2'>
            {user && user.role === 'recruiter' ? (
              <>
                <NavLink to="/admin/companies" icon={Building}>Companies</NavLink>
                <NavLink to="/admin/jobs" icon={Briefcase}>Jobs</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" icon={Home}>Home</NavLink>
                <NavLink to="/jobs" icon={Briefcase}>Jobs</NavLink>
                <NavLink to="/browse" icon={Search}>Browse</NavLink>
                <NavLink to="/career-assistant" icon={Brain}>Analyzer</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
