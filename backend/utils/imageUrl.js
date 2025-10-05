// Utility function to normalize image URLs for production
export const imageURL = (url) => {
  if (!url) return url;
  
  // If URL contains localhost:5000, replace with production backend URL
  if (url.includes('localhost:5000')) {
    let baseUrl;
    
    if (process.env.BACKEND_URL) {
      baseUrl = process.env.BACKEND_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      // Keep localhost in development
      return url;
    }
    
    return url.replace('http://localhost:5000', baseUrl);
  }
  
  return url;
};

// Helper function to normalize profile image URLs in user details objects
export const normalizeUserDetailsImageUrl = (userDetails) => {
  if (!userDetails) return userDetails;
  
  if (typeof userDetails.toObject === 'function') {
    // It's a Mongoose document
    return {
      ...userDetails.toObject(),
      profileImageUrl: imageURL(userDetails.profileImageUrl)
    };
  } else {
    // It's a plain object
    return {
      ...userDetails,
      profileImageUrl: imageURL(userDetails.profileImageUrl)
    };
  }
};

export default imageURL;