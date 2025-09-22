import { apiService } from "./api.js";

class StudentService {
  // Get student's joined classes
  async getJoinedClasses() {
    try {
      const response = await apiService.get("/classes/student/joined");
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching joined classes:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch joined classes",
        data: [],
      };
    }
  }

  // Get detailed class information for student
  async getClassDetails(classId) {
    try {
      const response = await apiService.get(`/classes/student/${classId}`);
      return {
        success: true,
        data: response.data || {},
      };
    } catch (error) {
      console.error("Error fetching class details:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch class details",
        data: null,
      };
    }
  }

  // Get available classes for student (from their batch, open or request-to-join)
  async getAvailableClasses() {
    try {
      console.log("Calling API: /classes/student/available");
      const response = await apiService.get("/classes/student/available");
      console.log("API Response for available classes:", response);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching available classes:", error);
      console.error("Error details:", error.response?.data || error.message);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch available classes",
        data: [],
      };
    }
  }

  // Get student's own join requests
  async getMyJoinRequests() {
    try {
      console.log("Calling API: /class-join-requests/my-requests");
      const response = await apiService.get("/class-join-requests/my-requests");
      console.log("API Response for my requests:", response);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching join requests:", error);
      console.error("Error details:", error.response?.data || error.message);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch join requests",
        data: [],
      };
    }
  }

  // Leave a class
  async leaveClass(classId) {
    try {
      console.log("Calling API: /classes/student/" + classId + "/leave");
      const response = await apiService.delete(
        `/classes/student/${classId}/leave`
      );
      console.log("API Response for leave class:", response);
      return {
        success: true,
        message: response.message || "Successfully left the class",
        data: response.data || {},
      };
    } catch (error) {
      console.error("Error leaving class:", error);
      console.error("Error details:", error.response?.data || error.message);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to leave class",
        data: null,
      };
    }
  }
}

export default new StudentService();
