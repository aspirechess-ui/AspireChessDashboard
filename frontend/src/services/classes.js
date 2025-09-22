import { apiService } from "./api.js";

class ClassService {
  // Get all classes for teacher
  async getTeacherClasses() {
    try {
      const response = await apiService.get("/classes/teacher");
      return response;
    } catch (error) {
      console.error("Error fetching teacher classes:", error);
      throw error;
    }
  }

  // Get classes by batch
  async getClassesByBatch(batchId) {
    try {
      const response = await apiService.get(`/classes/batch/${batchId}`);
      return response;
    } catch (error) {
      console.error("Error fetching batch classes:", error);
      throw error;
    }
  }

  // Get single class
  async getClass(classId) {
    try {
      const response = await apiService.get(`/classes/${classId}`);
      return { success: true, data: response };
    } catch (error) {
      console.error("Error fetching class:", error);
      return { success: false, message: error.message };
    }
  }

  // Get class by name and batch
  async getClassByName(batchName, className) {
    try {
      const response = await apiService.get(
        `/classes/batch/${encodeURIComponent(
          batchName
        )}/class/${encodeURIComponent(className)}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Error fetching class by name:", error);
      return { success: false, message: error.message };
    }
  }

  // Create new class
  async createClass(classData) {
    try {
      const response = await apiService.post("/classes", classData);
      return response;
    } catch (error) {
      console.error("Error creating class:", error);
      return { success: false, message: error.message };
    }
  }

  // Update class
  async updateClass(classId, classData) {
    try {
      const response = await apiService.put(`/classes/${classId}`, classData);
      return response;
    } catch (error) {
      console.error("Error updating class:", error);
      return { success: false, message: error.message };
    }
  }

  // Delete class
  async deleteClass(classId) {
    try {
      const response = await apiService.delete(`/classes/${classId}`);
      return response;
    } catch (error) {
      console.error("Error deleting class:", error);
      return { success: false, message: error.message };
    }
  }
  // Get available students from the same batch for adding to class
  async getAvailableStudents(classId) {
    try {
      const response = await apiService.get(
        `/classes/${classId}/available-students`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Error fetching available students:", error);
      return { success: false, message: error.message };
    }
  }

  // Add students to class
  async addStudentsToClass(classId, studentIds) {
    try {
      const response = await apiService.post(
        `/classes/${classId}/add-students`,
        {
          studentIds,
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Error adding students to class:", error);
      return { success: false, message: error.message };
    }
  }

  // Remove student from class
  async removeStudentFromClass(classId, studentId) {
    try {
      const response = await apiService.delete(
        `/classes/${classId}/students/${studentId}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Error removing student from class:", error);
      return { success: false, message: error.message };
    }
  }
}

export default new ClassService();
