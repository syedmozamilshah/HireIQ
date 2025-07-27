import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import { Button } from '../ui/button'
import Radio from '../ui/radio'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2, Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';


const Login = () => {
    const { user } = useSelector(store => store.auth);
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    const { loading } = useSelector(Store => Store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.role) {
            toast.error("Please select your role");
            return;
        }
        try {
            dispatch(setLoading(true))
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.userData));
                navigate("/");
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Login failed")
        } finally {
            dispatch(setLoading(false));
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/")
        }
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navbar />
            <div className="flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Back
                    </button>

                    {/* Login Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <LogIn className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Welcome Back
                            </h1>
                            <p className="text-gray-600 mt-2">Sign in to your HireWirey account</p>
                        </div>

                        <form onSubmit={submitHandler} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label className="flex items-center text-sm font-medium text-gray-700">
                                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input 
                                        type="email" 
                                        placeholder="syedmozamilshah99@gmail.com" 
                                        value={input.email} 
                                        name="email" 
                                        onChange={changeEventHandler}
                                        className="pl-4 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label className="flex items-center text-sm font-medium text-gray-700">
                                    <Lock className="w-4 h-4 mr-2 text-blue-500" />
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••" 
                                        value={input.password} 
                                        name="password" 
                                        onChange={changeEventHandler}
                                        className="pl-4 pr-12 py-3 w-full border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        required 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-blue-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-700">I am a:</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            type="radio"
                                            id="jobseeker"
                                            name="role"
                                            value="jobseeker"
                                            checked={input.role === "jobseeker"}
                                            onChange={changeEventHandler}
                                            className="sr-only"
                                        />
                                        <label 
                                            htmlFor="jobseeker" 
                                            className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2 rounded-xl p-6 h-24 ${
                                                input.role === "jobseeker" 
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg' 
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-lg font-semibold">Job Seeker</div>
                                                <div className={`text-sm mt-1 ${
                                                    input.role === "jobseeker" ? 'text-blue-100' : 'text-gray-500'
                                                }`}>Find opportunities</div>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="radio"
                                            id="recruiter"
                                            name="role"
                                            value="recruiter"
                                            checked={input.role === "recruiter"}
                                            onChange={changeEventHandler}
                                            className="sr-only"
                                        />
                                        <label 
                                            htmlFor="recruiter" 
                                            className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2 rounded-xl p-6 h-24 ${
                                                input.role === "recruiter" 
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg' 
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-lg font-semibold">Recruiter</div>
                                                <div className={`text-sm mt-1 ${
                                                    input.role === "recruiter" ? 'text-blue-100' : 'text-gray-500'
                                                }`}>Hire talent</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                            {/* Sign Up Link */}
                            <div className="text-center pt-4">
                                <span className="text-gray-600">Don't have an account? </span>
                                <Link 
                                    to="/signup" 
                                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
