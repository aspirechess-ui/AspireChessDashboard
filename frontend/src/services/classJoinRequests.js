import { apiService } from "./api.js";

class ClassJoinRequestService {
  // Get pending requests for a class (Teacher)
  async getPendingRequests(classId) {
    try {
      const response = await apiService.get(
        `/class-join-requests/class/${classId}/pending`
      );
      // The API returns {success: true, data: Array}, so we need response.data
      return response.data || [];
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      throw new Error(error.message || "Failed to fetch pending requests");
    }
  }

  // Get all requests for a class (Teacher)
  async getClassRequests(classId, params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.status) queryParams.append("status", params.status);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const endpoint = `/class-join-requests/class/${classId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiService.get(endpoint);

      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching class requests:", error);
      throw new Error(error.message || "Failed to fetch class requests");
    }
  }

  // Create a join request (Student)
  async createJoinRequest(classId, requestMessage = "") {
    try {
      const response = await apiService.post("/class-join-requests", {
        classId,
        requestMessage,
      });

      return {
        success: true,
        data: response.data,
        message: response.message || "Join request submitted successfully",
      };
    } catch (error) {
      console.error("Error creating join request:", error);

      // Handle specific error cases
      if (error.response?.status === 429) {
        const timeLeft = error.response.data.timeLeft;
        throw new Error(
          error.response.data.message ||
            `Please wait ${timeLeft} minute${
              timeLeft !== 1 ? "s" : ""
            } before sending another request`
        );
      }

      throw new Error(error.message || "Failed to submit join request");
    }
  }

  // Approve a join request (Teacher)
  async approveRequest(requestId, reviewMessage = "") {
    try {
      const response = await apiService.patch(
        `/class-join-requests/${requestId}/approve`,
        {
          reviewMessage,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error approving join request:", error);
      throw new Error(error.message || "Failed to approve join request");
    }
  }

  // Reject a join request (Teacher)
  async rejectRequest(requestId, reviewMessage = "") {
    try {
      const response = await apiService.patch(
        `/class-join-requests/${requestId}/reject`,
        {
          reviewMessage,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error rejecting join request:", error);
      throw new Error(error.message || "Failed to reject join request");
    }
  }

  // Bulk approve join requests (Teacher)
  async bulkApproveRequests(requestIds, reviewMessage = "") {
    try {
      const response = await apiService.patch(
        `/class-join-requests/bulk/approve`,
        {
          requestIds,
          reviewMessage,
        }
      );

      return response;
    } catch (error) {
      console.error("Error bulk approving requests:", error);
      throw new Error(error.message || "Failed to bulk approve requests");
    }
  }

  // Bulk reject join requests (Teacher)
  async bulkRejectRequests(requestIds, reviewMessage) {
    try {
      const response = await apiService.patch(
        `/class-join-requests/bulk/reject`,
        {
          requestIds,
          reviewMessage,
        }
      );

      return response;
    } catch (error) {
      console.error("Error bulk rejecting requests:", error);
      throw new Error(error.message || "Failed to bulk reject requests");
    }
  }

  // Get student's own requests (Student)
  async getMyRequests(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.status) queryParams.append("status", params.status);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const endpoint = `/class-join-requests/my-requests${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiService.get(endpoint);

      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching my requests:", error);
      throw new Error(error.message || "Failed to fetch your requests");
    }
  }

  // Cancel a pending request (Student)
  async cancelRequest(requestId) {
    try {
      const response = await apiService.delete(
        `/class-join-requests/${requestId}`
      );

      return {
        success: true,
        message: response.message || "Join request cancelled successfully",
      };
    } catch (error) {
      console.error("Error cancelling join request:", error);
      throw new Error(error.message || "Failed to cancel join request");
    }
  }

  // Check if student can send a request (Student)
  async canRequestToJoin(classId) {
    try {
      const response = await apiService.get(
        `/class-join-requests/can-request/${classId}`
      );

      return response;
    } catch (error) {
      console.error("Error checking request eligibility:", error);
      throw new Error(error.message || "Failed to check request eligibility");
    }
  }

  // Helper method to get request status color
  getStatusColor(status) {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
  }

  // Helper method to get request status text
  getStatusText(status) {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  }

  // Validate join request data
  validateJoinRequestData(data) {
    const errors = [];

    if (!data.classId) {
      errors.push("Class ID is required");
    }

    if (data.requestMessage && data.requestMessage.length > 500) {
      errors.push("Request message must be less than 500 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

const classJoinRequestService = new ClassJoinRequestService();
export default classJoinRequestService;
