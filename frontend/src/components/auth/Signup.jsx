import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Link, useNavigate } from "react-router";
import axios from 'axios'
import { Button } from '../ui/button'
import Radio from '../ui/radio'
import { USER_API_END_POINT } from '@/utils/constant.jsx';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import Store from '@/redux/store.js';
import { setLoading } from '@/redux/authSlice';
import { Loader2, ArrowLeft, UserPlus, Upload, CheckCircle } from 'lucide-react';

const Signup = () => {
    const { user } = useSelector(store => store.auth);
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: ""
    });

    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const { loading } = useSelector(Store => Store.auth);
    const dispatch = useDispatch();

    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }

    const submitHandler = async (e) => {
        e.preventDefault();

        const phonePattern = /^\+92-3\d{9}$/;
        if (!phonePattern.test(input.phoneNumber)) {
            toast.error("Phone number must be in format +92-3XXXXXXXXX");
            return;
        }

        if (input.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            dispatch(setLoading(true));
            const formData = new FormData();
            formData.append("fullname", input.fullname);
            formData.append("email", input.email);
            formData.append("phoneNumber", input.phoneNumber);
            formData.append("password", input.password);
            formData.append("role", input.role);
            if (input.file) {
                formData.append("file", input.file)
            }
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message);
        } finally {
            dispatch(setLoading(false));
        }
    }


    useEffect(() => {
        if (user) {
            navigate("/")
        }
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
            <Navbar />
            <div className="flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-lg">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    {/* Signup Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Join Hirey Wirey
                            </h1>
                            <p className="text-gray-600 mt-2">Create your account and start your journey</p>
                        </div>

                        <form onSubmit={submitHandler} className="space-y-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                                <Input 
                                    type="text" 
                                    placeholder="Syed Mozamil Shah" 
                                    value={input.fullname} 
                                    name="fullname" 
                                    onChange={changeEventHandler}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                                <Input 
                                    type="email" 
                                    placeholder="syedmozamilshah99@gmail.com" 
                                    value={input.email} 
                                    name="email" 
                                    onChange={changeEventHandler}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                                <Input 
                                    type="text" 
                                    placeholder="+92-3XXXXXXXXX" 
                                    value={input.phoneNumber} 
                                    name="phoneNumber" 
                                    onChange={changeEventHandler}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Password</Label>
                                <Input 
                                    type="password" 
                                    placeholder="Create a strong password" 
                                    value={input.password} 
                                    name="password" 
                                    onChange={changeEventHandler}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    required
                                />
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

                            {/* File Upload */}
                            {input.role === 'jobseeker' && (
                                <div className="space-y-3">
                                    <Label className="flex items-center text-sm font-medium text-gray-700">
                                        <Upload className="w-4 h-4 mr-2 text-blue-500" />
                                        Resume Upload (PDF only) *
                                    </Label>
                                    <div className="relative">
                                        <Input 
                                            accept=".pdf" 
                                            type="file" 
                                            onChange={changeFileHandler}
                                            className="w-full px-4 py-8 min-h-[4rem] border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50 text-center flex items-center justify-center file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                            style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Please upload your resume in PDF format only
                                        </p>
                                    </div>
                                </div>
                            )}

                            {input.role === 'recruiter' && (
                                <div className="space-y-3">
                                    <Label className="flex items-center text-sm font-medium text-gray-700">
                                        <Upload className="w-4 h-4 mr-2 text-blue-500" />
                                        Profile Photo Upload (Optional)
                                    </Label>
                                    <div className="relative">
                                        <Input 
                                            accept="image/*" 
                                            type="file" 
                                            onChange={changeFileHandler}
                                            className="w-full px-4 py-8 min-h-[4rem] border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50 text-center flex items-center justify-center file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                            style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Upload a profile photo (JPG, PNG formats supported)
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <CheckCircle className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                            {/* Login Link */}
                            <div className="text-center pt-4">
                                <span className="text-gray-600">Already have an account? </span>
                                <Link 
                                    to="/login" 
                                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup
