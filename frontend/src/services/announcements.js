import apiService from "./api.js";

class AnnouncementService {
  // Get all announcements for the current user
  async getAnnouncements() {
    try {
      console.log("Fetching announcements...");
      const response = await apiService.get("/announcements");
      console.log("Announcements response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch announcements",
        data: [],
      };
    }
  }

  // Get announcements by type
  async getAnnouncementsByType(type, options = {}) {
    try {
      console.log(`Fetching ${type} announcements...`);
      let endpoint = `/announcements/type/${type}`;

      const params = new URLSearchParams();
      if (options.batchId) params.append("batchId", options.batchId);
      if (options.classId) params.append("classId", options.classId);

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await apiService.get(endpoint);
      console.log(`${type} announcements response:`, response);
      return response;
    } catch (error) {
      console.error(`Error fetching ${type} announcements:`, error);
      return {
        success: false,
        message: error.message || `Failed to fetch ${type} announcements`,
        data: [],
      };
    }
  }

  // Get single announcement
  async getAnnouncement(id) {
    try {
      console.log("Fetching announcement:", id);
      const response = await apiService.get(`/announcements/${id}`);
      console.log("Announcement response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching announcement:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch announcement",
        data: null,
      };
    }
  }

  // Create new announcement
  async createAnnouncement(announcementData) {
    try {
      console.log("Creating announcement:", announcementData);
      const response = await apiService.post(
        "/announcements",
        announcementData
      );
      console.log("Create announcement response:", response);
      return response;
    } catch (error) {
      console.error("Error creating announcement:", error);
      return {
        success: false,
        message: error.message || "Failed to create announcement",
        data: null,
      };
    }
  }

  // Update announcement
  async updateAnnouncement(id, announcementData) {
    try {
      console.log("Updating announcement:", id, announcementData);
      const response = await apiService.put(
        `/announcements/${id}`,
        announcementData
      );
      console.log("Update announcement response:", response);
      return response;
    } catch (error) {
      console.error("Error updating announcement:", error);
      return {
        success: false,
        message: error.message || "Failed to update announcement",
        data: null,
      };
    }
  }

  // Delete announcement
  async deleteAnnouncement(id) {
    try {
      console.log("Deleting announcement:", id);
      const response = await apiService.delete(`/announcements/${id}`);
      console.log("Delete announcement response:", response);
      return response;
    } catch (error) {
      console.error("Error deleting announcement:", error);
      return {
        success: false,
        message: error.message || "Failed to delete announcement",
      };
    }
  }

  // Mark announcement as read
  async markAsRead(id) {
    try {
      console.log("Marking announcement as read:", id);
      const response = await apiService.post(`/announcements/${id}/read`);
      console.log("Mark as read response:", response);
      return response;
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      return {
        success: false,
        message: error.message || "Failed to mark announcement as read",
      };
    }
  }

  // Get read status for an announcement
  async getReadStatus(id) {
    try {
      console.log("Fetching read status for announcement:", id);
      const response = await apiService.get(`/announcements/${id}/read-status`);
      console.log("Read status response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching read status:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch read status",
        data: [],
      };
    }
  }

  // Get unread announcements count
  async getUnreadCount() {
    try {
      console.log("Fetching unread announcements count...");
      const response = await apiService.get("/announcements/unread/count");
      console.log("Unread count response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch unread count",
        data: { count: 0 },
      };
    }
  }

  // Get available targets (batches and classes) for announcement creation
  async getTargets() {
    try {
      console.log("Fetching announcement targets...");
      const response = await apiService.get("/announcements/targets");
      console.log("Targets response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching targets:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch announcement targets",
        data: { batches: [], classes: [] },
      };
    }
  }

  // Helper method to get academy announcements
  async getAcademyAnnouncements() {
    return this.getAnnouncementsByType("academy");
  }

  // Helper method to get batch announcements
  async getBatchAnnouncements(batchId) {
    return this.getAnnouncementsByType("batch", { batchId });
  }

  // Helper method to get class announcements
  async getClassAnnouncements(classId) {
    return this.getAnnouncementsByType("class", { classId });
  }
}

const announcementService = new AnnouncementService();
export { announcementService };
export default announcementService;
