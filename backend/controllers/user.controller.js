import { User } from "../models/user.model.js";
import crypto from "crypto";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Please fill all fields",
                success: false
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email",
                success: false
            });
        }

        // Simple hash for password (basic hashing without bcrypt)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Handle resume upload for jobseekers
        let resumeBase64 = null;
        let resumeOriginalName = null;
        
        if (role === 'jobseeker' && req.file) {
            // Validate PDF file
            if (!req.file.originalname.toLowerCase().endsWith('.pdf')) {
                return res.status(400).json({
                    message: "Only PDF files are allowed for resume",
                    success: false
                });
            }
            
            // Convert to base64
            resumeBase64 = req.file.buffer.toString('base64');
            resumeOriginalName = req.file.originalname;
        }

        // Create user
        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                resumeBase64: resumeBase64,
                resumeOriginalName: resumeOriginalName,
                profilePhoto: ""
            }
        });

        return res.status(201).json({
            message: "User created successfully",
            success: true,
            user: {
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            message: `Internal server error: ${error.message}`,
            success: false
        });
    }
}

export const login = async (req, res) => {
    console.log("Login request received", req.body);
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Please fill all fields",
                success: false
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email and password",
                success: false
            });
        }
        
        const hashedInputPassword = crypto.createHash('sha256').update(password).digest('hex');
        const isPasswordMatched = hashedInputPassword === user.password;
        if (!isPasswordMatched) {
            return res.status(400).json({
                message: "Incorrect email and password",
                success: false
            });
        }
        
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with this role",
                success: false
            });
        }

        const userData = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        // Simple session-based auth using cookies
        return res.status(200)
            .cookie("userId", user._id.toString(), { 
                maxAge: 1 * 24 * 60 * 60 * 1000, 
                httpOnly: true, 
                sameSite: 'strict' 
            })
            .cookie("userRole", user.role, { 
                maxAge: 1 * 24 * 60 * 60 * 1000, 
                httpOnly: true, 
                sameSite: 'strict' 
            })
            .json({
                message: `Welcome back ${user.fullname}`,
                userData,
                success: true,
            });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            message: `Internal server error: ${error.message}`,
            success: false
        });
    }
}


export const logout = async (req, res) => {
    try {
        return res.status(200)
            .cookie("userId", "", { maxAge: 0 })
            .cookie("userRole", "", { maxAge: 0 })
            .json({
                message: "Logged out successfully",
                success: true
            })
    } catch (error) {
        return res.status(500).json({
            message: `Internal Server Error ${error}`,
            success: false
        })
    }
}



export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;

        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }
        const userId = req.id; //from middleware 

        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        let count = 0;
        if (fullname) {
            user.fullname = fullname;
            count += 1;
        }

        if (email) {
            user.email = email;
            count += 1;
        }

        if (phoneNumber) {
            user.phoneNumber = phoneNumber;
            count += 1;
        }

        if (bio) {
            user.profile.bio = bio;
            count += 1;
        }

        if (skills) {
            user.profile.skills = skillsArray;
            count += 1;
        }
        
        // Handle resume update for jobseekers
        if (file && user.role === 'jobseeker') {
            if (file.originalname.toLowerCase().endsWith('.pdf')) {
                user.profile.resumeBase64 = file.buffer.toString('base64');
                user.profile.resumeOriginalName = file.originalname;
                count += 1;
            } else {
                return res.status(400).json({
                    message: "Only PDF files are allowed for resume",
                    success: false
                });
            }
        }
        
        if (count > 0) {
            await user.save();

            const updatedUser = {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                profile: user.profile
            }

            return res.status(200).json({
                message: "Profile updated successfully",
                user: updatedUser,
                success: true
            })
        } else {
            return res.status(400).json({
                message: "No data to update",
                success: false
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: `Internal server error ${error}`,
            success: false
        })
    }
}
