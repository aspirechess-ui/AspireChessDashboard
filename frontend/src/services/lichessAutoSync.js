import api from './api.js';

const lichessAutoSyncService = {
  // Auto sync for student on login/page load
  autoSyncStudent: async () => {
    try {
      const response = await api.post('/lichess-auto-sync/auto-sync-student');
      return response; // api.post already returns the data directly
    } catch (error) {
      console.error('Auto sync student error:', error);
      throw error;
    }
  },

  // Auto sync for teacher when viewing student
  autoSyncTeacher: async (username) => {
    try {
      const response = await api.post(`/lichess-auto-sync/auto-sync-teacher/${username}`);
      return response; // api.post already returns the data directly
    } catch (error) {
      console.error('Auto sync teacher error:', error);
      throw error;
    }
  },

  // Manual sync for teacher when viewing student (force sync)
  manualSyncTeacher: async (username) => {
    try {
      console.log(`Calling manual sync for username: ${username}`);
      const response = await api.post(`/lichess-auto-sync/manual-sync-teacher/${username}`);
      console.log('Manual sync response:', response);
      return response; // api.post already returns the data directly
    } catch (error) {
      console.error('Manual sync teacher error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Check sync status without syncing
  getSyncStatus: async () => {
    try {
      const response = await api.get('/lichess-auto-sync/sync-status');
      return response; // api.get already returns the data directly
    } catch (error) {
      console.error('Get sync status error:', error);
      throw error;
    }
  }
};

export default lichessAutoSyncService;