import StoryService from '../api/story-service';

const StoryModel = {
  async register(data) {
    return StoryService.register(data);
  },

  async login(credentials) {
    const response = await StoryService.login(credentials);

    StoryService.setAuthToken(response.token);
    return response;
  },

  async addNewStory(formData) {
    return StoryService.addNewStory(formData);
  },

  async getAllStories() {
    const token = StoryService.getAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return StoryService.getAllStories(token);
  },

  getAuthToken() {
    return StoryService.getAuthToken();
  },

  removeAuthToken() {
    StoryService.removeAuthToken();
  },
};

export default StoryModel;