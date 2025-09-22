import { apiService } from "./api.js";

class AuthService {
  // Logout user
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await apiService.get("/auth/verify");

      if (response.success && response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      // If token verification fails, clear local storage
      this.logout();
      throw error;
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole("admin");
  }

  // Check if user is teacher
  isTeacher() {
    return this.hasRole("teacher");
  }

  // Check if user is student
  isStudent() {
    return this.hasRole("student");
  }

  // Account Settings Functions

  // Change password with current password verification
  async changePassword(currentPassword, newPassword) {
    const response = await apiService.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response;
  }

  // Request email change verification code
  async requestEmailChange(newEmail) {
    const response = await apiService.post("/auth/change-email-request", {
      newEmail,
    });
    return response;
  }

  // Verify email change with code
  async verifyEmailChange(verificationCode) {
    const response = await apiService.post("/auth/change-email-verify", {
      verificationCode,
    });

    // Update user data in localStorage if email change is successful
    if (response.success && response.newEmail) {
      const user = this.getCurrentUser();
      if (user) {
        user.email = response.newEmail;
        localStorage.setItem("user", JSON.stringify(user));
      }
    }

    return response;
  }

  // Verify any type of code (email_change or password_reset)
  async verifyCode(verificationCode, type) {
    const response = await apiService.post("/auth/verify-code", {
      verificationCode,
      type,
    });
    return response;
  }

  // Request forgot password verification code (for authenticated users)
  async requestForgotPasswordCode() {
    const response = await apiService.post("/auth/forgot-password-code", {});
    return response;
  }

  // Request forgot password verification code (for public/unauthenticated users)
  async requestPublicForgotPasswordCode(email) {
    const response = await apiService.post("/auth/public-forgot-password-code", {
      email,
    });
    return response;
  }

  // Verify forgot password code (for authenticated users)
  async verifyForgotPasswordCode(verificationCode) {
    return this.verifyCode(verificationCode, "password_reset");
  }

  // Verify forgot password code (for public/unauthenticated users)
  async verifyPublicForgotPasswordCode(email, verificationCode) {
    const response = await apiService.post("/auth/public-verify-password-code", {
      email,
      verificationCode,
    });
    return response;
  }

  // Reset password with verification code (for authenticated users)
  async resetPasswordWithCode(verificationCode, newPassword) {
    const response = await apiService.post("/auth/reset-password-code", {
      verificationCode,
      newPassword,
    });

    // If successful, store the new token
    if (response.success && response.token) {
      localStorage.setItem("token", response.token);
      // Verify token to get updated user data
      await this.verifyToken();
    }

    return response;
  }

  // Reset password with verification code (for public/unauthenticated users)
  async resetPublicPasswordWithCode(email, verificationCode, newPassword) {
    const response = await apiService.post("/auth/public-reset-password-code", {
      email,
      verificationCode,
      newPassword,
    });

    // If successful, store the new token
    if (response.success && response.token) {
      localStorage.setItem("token", response.token);
      // Verify token to get updated user data
      await this.verifyToken();
    }

    return response;
  }
}

export default new AuthService();
