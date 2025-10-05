// Frontend utility to normalize image URLs
export const normalizeImageUrl = (url) => {
  if (!url) return null;
  
  // If URL contains localhost:5000, replace with production backend URL
  if (url.includes('localhost:5000')) {
    // Get the backend URL from environment or use default
    const backendUrl = import.meta.env.VITE_API_URL || 'https://aspire-chess-dashboard-backend.vercel.app';
    return url.replace('http://localhost:5000', backendUrl);
  }
  
  return url;
};

// Helper function to normalize profile image URLs in user objects
export const normalizeUserImageUrl = (user) => {
  if (!user) return user;
  
  return {
    ...user,
    userDetails: user.userDetails ? {
      ...user.userDetails,
      profileImageUrl: normalizeImageUrl(user.userDetails.profileImageUrl)
    } : null
  };
};

export default normalizeImageUrl;