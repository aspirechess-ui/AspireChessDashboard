import { apiService } from "./api.js";

class LichessService {  // Get individual student stats (for teachers and admins) - unified endpoint
  async getStudentStats(username) {
    try {
      const response = await apiService.get(`/lichess/stats/${username}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch student Lichess data");
    }
  }

  // Connect Lichess account
  async connectAccount(lichessUsername) {
    try {
      const response = await apiService.post("/lichess/connect", {
        lichessUsername: lichessUsername.trim()
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to connect Lichess account");
    }
  }

  // Disconnect Lichess account
  async disconnectAccount() {
    try {
      const response = await apiService.delete("/lichess/disconnect");
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to disconnect Lichess account");
    }
  }

  // Get current user's Lichess account (unified endpoint)
  async getAccount() {
    try {
      const response = await apiService.get("/lichess/stats");
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch Lichess account");
    }
  }

  // Sync Lichess data
  async syncData() {
    try {
      const response = await apiService.post("/lichess/sync");
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to sync Lichess data");
    }
  }

  // Get teacher overview (for teachers and admins)
  async getTeacherOverview() {
    try {
      const response = await apiService.get("/lichess/teacher/overview");
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch teacher overview");
    }
  }

  // Get all connected students (for teachers and admins)
  async getConnectedStudents() {
    try {
      const response = await apiService.get("/lichess/students");
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch connected students");
    }
  }

  // Sync individual student data (for teachers and admins)
  async syncStudentData(username) {
    try {
      const response = await apiService.post(`/lichess/student/${username}/sync`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to sync student data");
    }
  }

  // Helper methods for data processing
  formatRating(perfs, gameType = "blitz") {
    return perfs?.[gameType]?.rating || 0;
  }

  getRatingColor(rating) {
    if (rating >= 2000) return "purple";
    if (rating >= 1800) return "blue";
    if (rating >= 1600) return "green";
    if (rating >= 1400) return "orange";
    return "gray";
  }

  formatGameCount(count) {
    if (!count) return 0;
    return count.all || 0;
  }

  formatWinRate(count) {
    if (!count || !count.all || count.all === 0) return 0;
    return Math.round((count.win / count.all) * 100);
  }

  formatLastSeen(seenAt) {
    if (!seenAt) return "Never";
    
    const now = new Date();
    const seen = new Date(seenAt);
    const diffMs = now - seen;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return seen.toLocaleDateString();
  }

  formatPlayTime(totalSeconds) {
    if (!totalSeconds) return "0h 0m";
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  }

  // Get primary rating for a user (prefers blitz, then rapid, then classical)
  getPrimaryRating(perfs) {
    if (!perfs) return 0;
    
    return perfs.blitz?.rating || 
           perfs.rapid?.rating || 
           perfs.classical?.rating || 
           perfs.bullet?.rating || 
           0;
  }

  // Get game type with highest rating
  getPreferredGameType(perfs) {
    if (!perfs) return "blitz";
    
    let highestRating = 0;
    let preferredType = "blitz";
    
    Object.entries(perfs).forEach(([type, data]) => {
      if (data.rating && data.rating > highestRating) {
        highestRating = data.rating;
        preferredType = type;
      }
    });
    
    return preferredType;
  }

  // Check if account data is stale (older than 1 hour)
  isDataStale(lastSyncAt) {
    if (!lastSyncAt) return true;
    
    const now = new Date();
    const sync = new Date(lastSyncAt);
    const diffMs = now - sync;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours > 1;
  }

  // Format rating change
  formatRatingChange(prog) {
    if (!prog || prog === 0) return "";
    return prog > 0 ? `+${prog}` : `${prog}`;
  }

  // Get rating trend
  getRatingTrend(prog) {
    if (!prog || prog === 0) return "neutral";
    return prog > 0 ? "up" : "down";
  }
}

export default new LichessService();
