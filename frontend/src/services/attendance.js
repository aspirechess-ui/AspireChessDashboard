import { apiService } from "./api.js";

class AttendanceService {
  // Create new attendance record
  async createAttendance(attendanceData) {
    try {
      console.log("Creating attendance with data:", attendanceData);
      const response = await apiService.post("/attendance", attendanceData);
      console.log("Attendance creation response:", response);
      return response;
    } catch (error) {
      console.error("Error creating attendance:", error);
      console.error("Error details:", error.response?.data);
      throw error;
    }
  }

  // Get attendance records for a class
  async getClassAttendance(classId, params = {}) {
    try {
      console.log(
        "Fetching attendance for class:",
        classId,
        "with params:",
        params
      );
      const queryParams = new URLSearchParams();

      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const queryString = queryParams.toString();
      const url = `/attendance/class/${classId}${
        queryString ? `?${queryString}` : ""
      }`;

      console.log("Attendance API URL:", url);
      const response = await apiService.get(url);
      console.log("Attendance fetch response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching class attendance:", error);
      console.error("Error details:", error.response?.data);
      // Return empty success response for development
      if (error.response?.status === 404) {
        return {
          success: true,
          data: {
            attendanceRecords: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalRecords: 0,
              recordsPerPage: params.limit || 10,
            },
          },
        };
      }
      throw error;
    }
  }

  // Get specific attendance record
  async getAttendance(attendanceId) {
    try {
      const response = await apiService.get(`/attendance/${attendanceId}`);
      return response;
    } catch (error) {
      console.error("Error fetching attendance record:", error);
      throw error;
    }
  }

  // Update attendance record
  async updateAttendance(attendanceId, attendanceData) {
    try {
      const response = await apiService.put(
        `/attendance/${attendanceId}`,
        attendanceData
      );
      return response;
    } catch (error) {
      console.error("Error updating attendance:", error);
      throw error;
    }
  }

  // Get attendance by specific date for a class
  async getAttendanceByDate(classId, date) {
    try {
      const response = await apiService.get(
        `/attendance/class/${classId}/date/${date}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching attendance by date:", error);
      throw error;
    }
  }

  // Check if attendance exists for a class and date
  async checkAttendanceExists(classId, date) {
    try {
      const response = await this.getAttendanceByDate(classId, date);
      return { exists: true, data: response };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { exists: false, data: null };
      }
      throw error;
    }
  }

  // Get attendance summary/statistics for a class
  async getAttendanceStats(classId, params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);

      const queryString = queryParams.toString();
      const url = `/attendance/stats/${classId}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error("Error fetching attendance statistics:", error);
      throw error;
    }
  }

  // Validate attendance data before submission
  validateAttendanceData(attendanceData) {
    const errors = [];

    if (!attendanceData.classId) {
      errors.push("Class ID is required");
    }

    if (!attendanceData.batchId) {
      errors.push("Batch ID is required");
    }

    if (!attendanceData.sessionDate) {
      errors.push("Session date is required");
    }

    if (!attendanceData.sessionTime) {
      errors.push("Session time is required");
    }

    if (
      !attendanceData.attendanceRecords ||
      attendanceData.attendanceRecords.length === 0
    ) {
      errors.push("At least one attendance record is required");
    }

    // Validate attendance records
    if (attendanceData.attendanceRecords) {
      attendanceData.attendanceRecords.forEach((record, index) => {
        if (!record.studentId) {
          errors.push(`Student ID is required for record ${index + 1}`);
        }

        if (
          !record.status ||
          !["present", "absent", "late", "excused"].includes(record.status)
        ) {
          errors.push(`Valid status is required for record ${index + 1}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Submit attendance (change status from draft to final)
  async submitAttendance(attendanceId) {
    try {
      const response = await apiService.patch(
        `/attendance/${attendanceId}/submit`
      );
      return response;
    } catch (error) {
      console.error("Error submitting attendance:", error);
      throw error;
    }
  }

  // Delete attendance record
  async deleteAttendance(attendanceId) {
    try {
      const response = await apiService.delete(`/attendance/${attendanceId}`);
      return response;
    } catch (error) {
      console.error("Error deleting attendance:", error);
      throw error;
    }
  }

  // Format attendance data for API submission
  formatAttendanceData(formData) {
    return {
      classId: formData.classId,
      batchId: formData.batchId,
      sessionDate: formData.sessionDate,
      sessionTime: formData.sessionTime,
      attendanceRecords: formData.attendanceRecords.map((record) => ({
        studentId: record.studentId,
        status: record.status,
        notes: record.notes || "",
      })),
    };
  }

  // Student Attendance Methods

  // Get student's attendance records for a specific class
  async getStudentClassAttendance(classId, params = {}) {
    try {
      console.log(
        "Fetching student attendance for class:",
        classId,
        "with params:",
        params
      );
      const queryParams = new URLSearchParams();

      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const queryString = queryParams.toString();
      const url = `/attendance/student/class/${classId}${
        queryString ? `?${queryString}` : ""
      }`;

      console.log("Student attendance API URL:", url);
      const response = await apiService.get(url);
      console.log("Student attendance fetch response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching student class attendance:", error);
      console.error("Error details:", error.response?.data);
      // Return empty success response for development
      if (error.response?.status === 404) {
        return {
          success: true,
          data: {
            attendanceRecords: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalRecords: 0,
              recordsPerPage: params.limit || 50,
            },
          },
        };
      }
      throw error;
    }
  }

  // Get student's attendance statistics for a specific class
  async getStudentAttendanceStats(classId, params = {}) {
    try {
      console.log(
        "Fetching student attendance stats for class:",
        classId,
        "with params:",
        params
      );
      const queryParams = new URLSearchParams();

      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);

      const queryString = queryParams.toString();
      const url = `/attendance/student/stats/${classId}${
        queryString ? `?${queryString}` : ""
      }`;

      console.log("Student attendance stats API URL:", url);
      const response = await apiService.get(url);
      console.log("Student attendance stats response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching student attendance statistics:", error);
      console.error("Error details:", error.response?.data);
      // Return empty stats for development
      if (error.response?.status === 404) {
        return {
          success: true,
          data: {
            totalSessions: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            excusedCount: 0,
            attendancePercentage: 0,
            dateRange: {
              startDate: params.startDate || null,
              endDate: params.endDate || null,
            },
            className: null,
            batchName: null,
          },
        };
      }
      throw error;
    }
  }

  // Helper method to get attendance data for charts
  formatAttendanceForCharts(attendanceRecords) {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return [];
    }

    return attendanceRecords.map((record) => ({
      date: new Date(record.sessionDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: record.sessionDate,
      status: record.status,
      sessionTime: record.sessionTime,
      notes: record.notes || "",
      isPresent: record.status === "present" || record.status === "late",
      isAbsent: record.status === "absent",
      isExcused: record.status === "excused",
      isLate: record.status === "late",
    }));
  }

  // Helper method to calculate attendance trend
  calculateAttendanceTrend(attendanceRecords, periodDays = 7) {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return [];
    }

    const trend = [];
    const sortedRecords = [...attendanceRecords].sort(
      (a, b) => new Date(a.sessionDate) - new Date(b.sessionDate)
    );

    for (let i = 0; i < sortedRecords.length; i += periodDays) {
      const periodRecords = sortedRecords.slice(i, i + periodDays);
      const presentCount = periodRecords.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length;
      const totalCount = periodRecords.length;
      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

      trend.push({
        period: `Week ${Math.floor(i / periodDays) + 1}`,
        percentage: Math.round(percentage * 100) / 100,
        totalSessions: totalCount,
        presentSessions: presentCount,
        startDate: periodRecords[0]?.sessionDate,
        endDate: periodRecords[periodRecords.length - 1]?.sessionDate,
      });
    }

    return trend;
  }
}

export default new AttendanceService();
