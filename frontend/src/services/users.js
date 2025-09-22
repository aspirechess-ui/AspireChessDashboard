import { apiService } from "./api.js";

class UserService {
  // Get user profile
  async getProfile(userId = null) {
    try {
      const endpoint = userId ? `/users/${userId}/profile` : "/users/profile";
      return await apiService.get(endpoint);
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData, userId = null) {
    try {
      const endpoint = userId ? `/users/${userId}/profile` : "/users/profile";
      return await apiService.put(endpoint, profileData);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(imageFile, userId = null) {
    try {
      const formData = new FormData();
      formData.append("profileImage", imageFile);

      const endpoint = userId
        ? `/users/${userId}/profile/image`
        : "/users/profile/image";

      // For file uploads, we need to use a custom request without Content-Type header
      const url = `${apiService.baseURL}${endpoint}`;
      const token = apiService.getAuthToken();

      console.log(`Uploading image to: ${url}`);
      console.log("FormData contents:", formData.get("profileImage"));

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary
        },
      });

      console.log(`Upload response status: ${response.status}`);

      const data = await response.json();
      console.log("Upload response data:", data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  // Delete profile image
  async deleteProfileImage(userId = null) {
    try {
      const endpoint = userId
        ? `/users/${userId}/profile/image`
        : "/users/profile/image";
      return await apiService.delete(endpoint);
    } catch (error) {
      console.error("Error deleting profile image:", error);
      throw error;
    }
  }

  // Get user settings
  async getSettings() {
    try {
      return await apiService.get("/users/settings");
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  }

  // Update user settings
  async updateSettings(settings) {
    try {
      return await apiService.put("/users/settings", settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      return await apiService.put("/users/change-password", passwordData);
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  // Email change management
  async requestEmailChange(newEmail) {
    try {
      return await apiService.post("/users/request-email-change", { newEmail });
    } catch (error) {
      console.error("Error requesting email change:", error);
      throw error;
    }
  }

  async verifyEmailChange(newEmail, verificationCode) {
    try {
      return await apiService.post("/users/verify-email-change", {
        newEmail,
        verificationCode,
      });
    } catch (error) {
      console.error("Error verifying email change:", error);
      throw error;
    }
  }

  // Password reset management
  async requestPasswordReset(email) {
    try {
      return await apiService.post("/users/request-password-reset", { email });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      throw error;
    }
  }

  async resetPasswordWithCode(resetData) {
    try {
      return await apiService.post(
        "/users/reset-password-with-code",
        resetData
      );
    } catch (error) {
      console.error("Error resetting password with code:", error);
      throw error;
    }
  }

  // Get user details (admin functionality)
  async getUserDetails(userId) {
    try {
      return await apiService.get(`/users/${userId}`);
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  }

  // Search users (admin/teacher functionality)
  async searchUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/users/search?${queryString}`);
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userId = null) {
    try {
      const endpoint = userId ? `/users/${userId}/stats` : "/users/stats";
      return await apiService.get(endpoint);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }

  // Get user's batch information
  async getUserBatch(userId = null) {
    try {
      const endpoint = userId ? `/users/${userId}/batch` : "/users/batch";
      return await apiService.get(endpoint);
    } catch (error) {
      console.error("Error fetching user batch:", error);
      throw error;
    }
  }

  // Get user's classes
  async getUserClasses(userId = null, params = {}) {
    try {
      const endpoint = userId ? `/users/${userId}/classes` : "/users/classes";
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`${endpoint}?${queryString}`);
    } catch (error) {
      console.error("Error fetching user classes:", error);
      throw error;
    }
  }

  // Get user notifications
  async getNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/users/notifications?${queryString}`);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      return await apiService.put(
        `/users/notifications/${notificationId}/read`
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      return await apiService.put("/users/notifications/read-all");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Get unread notifications count
  async getUnreadNotificationsCount() {
    try {
      return await apiService.get("/users/notifications/unread-count");
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      return await apiService.delete(`/users/notifications/${notificationId}`);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Update email
  async updateEmail(newEmail, password) {
    try {
      return await apiService.put("/users/email", { newEmail, password });
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  }

  // Get user preferences
  async getPreferences() {
    try {
      return await apiService.get("/users/preferences");
    } catch (error) {
      console.error("Error fetching preferences:", error);
      throw error;
    }
  }

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      return await apiService.put("/users/preferences", preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  }

  // Get user roles and permissions
  async getUserPermissions(userId = null) {
    try {
      const endpoint = userId
        ? `/users/${userId}/permissions`
        : "/users/permissions";
      return await apiService.get(endpoint);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      throw error;
    }
  }

  // Update user permissions (admin functionality)
  async updateUserPermissions(userId, permissions) {
    try {
      return await apiService.put(`/users/${userId}/permissions`, permissions);
    } catch (error) {
      console.error("Error updating user permissions:", error);
      throw error;
    }
  }

  // Update user status (admin functionality)
  async updateUserStatus(userId, status) {
    try {
      return await apiService.put(`/users/${userId}/status`, { status });
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  }

  // Reset user password (admin functionality)
  async resetUserPassword(userId, newPassword) {
    try {
      return await apiService.put(`/users/${userId}/reset-password`, {
        newPassword,
      });
    } catch (error) {
      console.error("Error resetting user password:", error);
      throw error;
    }
  }

  // Get user activity log
  async getActivityLog(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiService.get(`/users/activity-log?${queryString}`);
    } catch (error) {
      console.error("Error fetching activity log:", error);
      throw error;
    }
  }

  // Export user data
  async exportUserData(format = "json") {
    try {
      return await apiService.get(`/users/export?format=${format}`);
    } catch (error) {
      console.error("Error exporting user data:", error);
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      return await apiService.post("/users/verify-email", { token });
    } catch (error) {
      console.error("Error verifying email:", error);
      throw error;
    }
  }

  // Resend email verification
  async resendEmailVerification() {
    try {
      return await apiService.post("/users/resend-verification");
    } catch (error) {
      console.error("Error resending email verification:", error);
      throw error;
    }
  }

  // Deactivate account
  async deactivateAccount(reason = "") {
    try {
      return await apiService.put("/users/deactivate", { reason });
    } catch (error) {
      console.error("Error deactivating account:", error);
      throw error;
    }
  }

  // Delete account (for students only)
  async deleteAccount(password) {
    try {
      return await apiService.delete("/users/account", { password });
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
