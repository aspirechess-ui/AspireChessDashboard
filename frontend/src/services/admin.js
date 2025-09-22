import { apiService } from "./api.js";

class AdminService {
  // Dashboard Statistics
  async getDashboardStats() {
    try {
      return await apiService.get("/admin/dashboard/stats");
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  // User Management
  async getUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/admin/users?${queryString}`);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Create Admin User
  async createAdmin(userData) {
    try {
      console.log("Creating admin user with data:", userData);
      return await apiService.post("/admin/users/admin", userData);
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }
  }

  // Create Teacher User
  async createTeacher(userData) {
    try {
      console.log("Creating teacher user with data:", userData);
      return await apiService.post("/admin/users/teacher", userData);
    } catch (error) {
      console.error("Error creating teacher user:", error);
      throw error;
    }
  }

  // Create User (Generic method that routes to specific endpoints)
  async createUser(userData) {
    try {
      if (userData.role === "admin") {
        return await this.createAdmin(userData);
      } else if (userData.role === "teacher") {
        return await this.createTeacher(userData);
      } else {
        throw new Error(
          "Invalid user role. Only admin and teacher accounts can be created."
        );
      }
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Delete User (Soft delete)
  async deleteUser(userId) {
    try {
      return await apiService.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Get User Details
  async getUserDetails(userId) {
    try {
      return await apiService.get(`/admin/users/${userId}`);
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  }

  // Update User
  async updateUser(userId, userData) {
    try {
      return await apiService.put(`/admin/users/${userId}`, userData);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Batch Management (placeholder methods for future implementation)
  async getBatches(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/admin/batches?${queryString}`);
    } catch (error) {
      console.error("Error fetching batches:", error);
      throw error;
    }
  }

  async createBatch(batchData) {
    try {
      return await apiService.post("/admin/batches", batchData);
    } catch (error) {
      console.error("Error creating batch:", error);
      throw error;
    }
  }

  async updateBatch(batchId, batchData) {
    try {
      return await apiService.put(`/admin/batches/${batchId}`, batchData);
    } catch (error) {
      console.error("Error updating batch:", error);
      throw error;
    }
  }

  async deleteBatch(batchId) {
    try {
      return await apiService.delete(`/admin/batches/${batchId}`);
    } catch (error) {
      console.error("Error deleting batch:", error);
      throw error;
    }
  }

  async markBatchForDeletion(batchId, reason) {
    try {
      return await apiService.put(`/admin/batches/${batchId}/mark-deletion`, {
        reason,
      });
    } catch (error) {
      console.error("Error marking batch for deletion:", error);
      throw error;
    }
  }

  async permanentlyDeleteBatch(batchId) {
    try {
      return await apiService.delete(`/admin/batches/${batchId}/permanent`);
    } catch (error) {
      console.error("Error permanently deleting batch:", error);
      throw error;
    }
  }

  async resetSignupCode(batchId) {
    try {
      return await apiService.put(`/admin/batches/${batchId}/reset-code`);
    } catch (error) {
      console.error("Error resetting signup code:", error);
      throw error;
    }
  }

  // Class Management
  async getAllClasses(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/admin/classes?${queryString}`);
    } catch (error) {
      console.error("Error fetching classes:", error);
      throw error;
    }
  }

  async getClassDetails(classId) {
    try {
      return await apiService.get(`/admin/classes/${classId}`);
    } catch (error) {
      console.error("Error fetching class details:", error);
      throw error;
    }
  }

  async updateClass(classId, classData) {
    try {
      return await apiService.put(`/admin/classes/${classId}`, classData);
    } catch (error) {
      console.error("Error updating class:", error);
      throw error;
    }
  }

  async deleteClass(classId) {
    try {
      return await apiService.delete(`/admin/classes/${classId}`);
    } catch (error) {
      console.error("Error deleting class:", error);
      throw error;
    }
  }

  // Announcement Management
  async getAnnouncements(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/admin/announcements?${queryString}`);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      throw error;
    }
  }

  async createAnnouncement(announcementData) {
    try {
      return await apiService.post("/admin/announcements", announcementData);
    } catch (error) {
      console.error("Error creating announcement:", error);
      throw error;
    }
  }

  async updateAnnouncement(announcementId, announcementData) {
    try {
      return await apiService.put(
        `/admin/announcements/${announcementId}`,
        announcementData
      );
    } catch (error) {
      console.error("Error updating announcement:", error);
      throw error;
    }
  }

  async deleteAnnouncement(announcementId) {
    try {
      return await apiService.delete(`/admin/announcements/${announcementId}`);
    } catch (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
  }

  // System Settings
  async getSystemSettings() {
    try {
      return await apiService.get("/admin/settings");
    } catch (error) {
      console.error("Error fetching system settings:", error);
      throw error;
    }
  }

  async updateSystemSettings(settings) {
    try {
      return await apiService.put("/admin/settings", settings);
    } catch (error) {
      console.error("Error updating system settings:", error);
      throw error;
    }
  }

  // Analytics and Reports
  async getUserAnalytics(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/admin/analytics/users?${queryString}`);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      throw error;
    }
  }

  async getBatchAnalytics(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/admin/analytics/batches?${queryString}`);
    } catch (error) {
      console.error("Error fetching batch analytics:", error);
      throw error;
    }
  }

  async getClassAnalytics(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/admin/analytics/classes?${queryString}`);
    } catch (error) {
      console.error("Error fetching class analytics:", error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
export default adminService;
