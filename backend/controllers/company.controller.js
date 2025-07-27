import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(200).json({
                message: "Company name can't be empty",
                success: false
            })
        }
        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(200).json({
                message: "Company already exists",
                success: false
            })
        }
        company = await Company.create({
            name: companyName,
            userId: req.id
        });
        return res.status(200).json({
            message: "Company resgistered successfully",
            company,
            success: true,
        })
    } catch (error) {
        return res.status(500).json({
            message: `Internal server error ${error}`,
            success: false
        })
    }
}


export const getCompany = async (req, res) => {
    try {
        const userId = req.id;
        const companies = await Company.find({ userId });
        if (!companies) {
            return res.status(200).json({
                message: "No company found",
                success: false
            })
        }
        return res.status(200).json({
            message: "Companies found",
            companies,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: `Internal server error ${error}`,
            success: false
        })

    }
}


export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;  //id showing in url
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(200).json({
                message: "No company found",
                success: false
            })
        }
        return res.status(200).json({
            message: "Company found",
            company,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: `Internal server error ${error}`,
            success: false
        })

    }
}


export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const file = req.file;
        //file to implement
        let logo = "https://res.cloudinary.com/dutgneyb7/image/upload/v1749121668/e065x1qnoji2mlbeq0cb.png";
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            logo = cloudResponse.secure_url;
        }


        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({
                message: "No company found",
                success: false
            })
        }
        let count = 0;
        if (name) {
            company.name = name;
            count += 1;
        }
        if (description) {
            company.description = description;
            count += 1;
        }
        if (website) {
            company.website = website;
            count += 1;
        }
        if (location) {
            company.location = location;
            count += 1;
        }
        if (logo) {
            company.logo = logo;
            count += 1;
        }


        if (count > 0) {
            await company.save();

            return res.status(200).json({
                message: "Company updated successfully",
                company,
                success: true
            })
        }
        else {
            return res.status(200).json({
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