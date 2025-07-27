import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen, Upload, Download, Eye, User, FileText, Camera, Briefcase } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'


const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const isResume = !!user?.profile?.resume;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            {/* Profile Header Card */}
            <div className='max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8 shadow-sm'>
                <div className='flex justify-between items-start'>
                    <div className='flex items-center gap-6'>
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-blue-100">
                                <AvatarImage 
                                    src={user?.profile?.profilePhoto} 
                                    alt="profile" 
                                    className="object-cover"
                                />
                                {!user?.profile?.profilePhoto && (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                                        {user?.fullname?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                            </Avatar>
                            {!user?.profile?.profilePhoto && (
                                <div className="absolute -bottom-2 -right-2 bg-gray-100 rounded-full p-2 shadow-md">
                                    <Camera className="w-4 h-4 text-gray-500" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className='font-bold text-2xl text-gray-900 mb-2'>{user?.fullname}</h1>
                            <p className="text-gray-600 mb-3">{user?.profile?.bio || "No bio added yet"}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {user?.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Contact className="w-4 h-4" />
                                    {user?.phoneNumber}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setOpen(true)} 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2"
                    >
                        <Pen className="w-4 h-4" />
                        Edit Profile
                    </Button>
                </div>

                {/* Skills Section */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Skills
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-wrap gap-2'>
                            {
                                user?.profile?.skills?.length > 0 ? (
                                    user.profile.skills.map((item, index) => (
                                        <Badge 
                                            key={index} 
                                            className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer px-3 py-1"
                                        >
                                            {item}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-gray-500 italic">No skills added yet</span>
                                )
                            }
                        </div>
                    </CardContent>
                </Card>

                {/* Resume Section */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            Resume
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {
                            isResume ? (
                                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <FileText className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {user?.profile?.resumeOriginalName || "Resume.pdf"}
                                            </p>
                                            <p className="text-sm text-gray-500">Uploaded resume</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(user?.profile?.resume, '_blank')}
                                            className="border-green-300 text-green-700 hover:bg-green-100"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(user?.profile?.resume, '_blank')}
                                            className="border-green-300 text-green-700 hover:bg-green-100"
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                                    <div className="text-center">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 font-medium mb-2">No resume uploaded</p>
                                        <p className="text-sm text-gray-500 mb-4">Upload your resume to get better job matches</p>
                                        <Button 
                                            onClick={() => setOpen(true)}
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Resume
                                        </Button>
                                    </div>
                                </div>
                            )
                        }
                    </CardContent>
                </Card>
            </div>

            {/* Applied Jobs Section */}
            <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8'>
                <h1 className='font-bold text-xl mb-6 flex items-center gap-2'>
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    Applied Jobs
                </h1>
                <AppliedJobTable />
            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile