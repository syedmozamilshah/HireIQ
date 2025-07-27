// Simplified local storage replacement for Cloudinary
// Since we're storing everything in MongoDB, this is just a placeholder

const cloudinary = {
    uploader: {
        upload: async (dataUri) => {
            // For now, we'll just return the data URI as the secure_url
            // In a real implementation, you could save to local filesystem
            return {
                secure_url: dataUri || "https://via.placeholder.com/150"
            };
        }
    }
};

export default cloudinary;
