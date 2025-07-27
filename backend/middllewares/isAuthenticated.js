const isAuthenticated = (req, res, next) => {
    try {
        const userId = req.cookies.userId;
        const userRole = req.cookies.userRole;
        
        if (!userId || !userRole) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            })
        }

        req.id = userId;
        req.role = userRole;
        next();
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export default isAuthenticated;
