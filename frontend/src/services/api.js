// Main API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// API utility class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("token");
  }

  // Get default headers with auth token
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    console.log(`Making API request to: ${url}`, config);

    try {
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status}`);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        const error = new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "GET",
      ...options,
    });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, data = null, options = {}) {
    const config = {
      method: "DELETE",
      ...options,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    return this.request(endpoint, config);
  }

  // PATCH request
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    });
  }
}

// Create and export API instance
export const apiService = new ApiService();

// Export individual service modules
export { default as authService } from "./auth.js";
export { default as adminService } from "./admin.js";
export { default as teacherService } from "./teacher.js";
export { default as studentService } from "./student.js";
export { default as userService } from "./users.js";
export { default as batchService } from "./batches.js";
export { default as classService } from "./classes.js";
export { default as announcementService } from "./announcements.js";
export { default as attendanceService } from "./attendance.js";
export { default as lichessService } from "./lichess.js";

// Common error handler
export const handleApiError = (error) => {
  console.error("API Error:", error);

  // Handle specific error types
  if (error.message.includes("401")) {
    // Unauthorized - redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }

  if (error.message.includes("403")) {
    // Forbidden - redirect to unauthorized page
    window.location.href = "/unauthorized";
    return;
  }

  // Return error for component handling
  return {
    success: false,
    error: error.message || "An unexpected error occurred",
  };
};

export default apiService;
