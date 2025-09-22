import { apiService } from "./api.js";

class BatchService {
  // Get all batches
  async getBatches(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.academicYear)
        queryParams.append("academicYear", params.academicYear);
      if (params.status) queryParams.append("status", params.status);

      const response = await apiService.get(
        `/batches?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching batches:", error);
      throw error;
    }
  }

  // Get batches for teachers
  async getBatchesForTeacher(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.academicYear)
        queryParams.append("academicYear", params.academicYear);
      if (params.status) queryParams.append("status", params.status);

      const response = await apiService.get(
        `/batches/teacher?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching batches for teacher:", error);
      throw error;
    }
  }

  // Get single batch
  async getBatch(batchId) {
    try {
      const response = await apiService.get(`/batches/${batchId}`);
      return response;
    } catch (error) {
      console.error("Error fetching batch:", error);
      throw error;
    }
  }

  // Get batch students
  async getBatchStudents(batchId) {
    try {
      const response = await apiService.get(`/batches/${batchId}/students`);
      return response;
    } catch (error) {
      console.error("Error fetching batch students:", error);
      throw error;
    }
  }

  // Create new batch
  async createBatch(batchData) {
    try {
      const response = await apiService.post("/batches", batchData);
      return response;
    } catch (error) {
      console.error("Error creating batch:", error);
      throw error;
    }
  }

  // Update batch
  async updateBatch(batchId, batchData) {
    try {
      const response = await apiService.put(`/batches/${batchId}`, batchData);
      return response;
    } catch (error) {
      console.error("Error updating batch:", error);
      throw error;
    }
  }

  // Reset signup code
  async resetSignupCode(batchId, reason = "") {
    try {
      const response = await apiService.post(
        `/batches/${batchId}/reset-signup-code`,
        {
          reason,
        }
      );
      return response;
    } catch (error) {
      console.error("Error resetting signup code:", error);
      throw error;
    }
  }

  // Toggle signup code status
  async toggleSignupCodeStatus(batchId, reason = "") {
    try {
      const response = await apiService.post(
        `/batches/${batchId}/toggle-signup-code`,
        {
          reason,
        }
      );
      return response;
    } catch (error) {
      console.error("Error toggling signup code status:", error);
      throw error;
    }
  }

  // Get usage logs
  async getUsageLogs(batchId, params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const response = await apiService.get(
        `/batches/${batchId}/usage-logs?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching usage logs:", error);
      throw error;
    }
  }

  // Delete batch (soft delete)
  async deleteBatch(batchId, reason = "") {
    try {
      console.log("BatchService.deleteBatch called with:", { batchId, reason });
      const response = await apiService.delete(`/batches/${batchId}`, {
        reason,
      });
      console.log("BatchService.deleteBatch response:", response);
      return response;
    } catch (error) {
      console.error("Error deleting batch:", error);
      throw error;
    }
  }

  // Get all activity logs across batches
  async getActivityLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);

      // Handle multiple batchId values (comma-separated)
      if (params.batchId) {
        if (Array.isArray(params.batchId)) {
          queryParams.append("batchId", params.batchId.join(","));
        } else {
          queryParams.append("batchId", params.batchId);
        }
      }

      // Handle multiple status values (comma-separated)
      if (params.status) {
        if (Array.isArray(params.status)) {
          queryParams.append("status", params.status.join(","));
        } else {
          queryParams.append("status", params.status);
        }
      }

      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);

      const response = await apiService.get(
        `/batches/activity-logs?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      throw error;
    }
  }

  // Get academic years (helper method)
  async getAcademicYears() {
    try {
      // This could be a separate endpoint or derived from existing batches
      const currentYear = new Date().getFullYear();
      const years = [];

      for (let i = -2; i <= 2; i++) {
        const startYear = currentYear + i;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear}`);
      }

      return { success: true, data: years };
    } catch (error) {
      console.error("Error generating academic years:", error);
      throw error;
    }
  }
}

export default new BatchService();
