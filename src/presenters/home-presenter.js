import StoryModel from "../models/story-model";
import HomeView from "../views/home-view";
import { putStories, getAllStoriesIDB } from "../utils/idb";

class HomePresenter {
  constructor(viewContainer) {
    this._view = new HomeView(viewContainer);
  }

  async render() {
    const token = StoryModel.getAuthToken();
    if (!token) {
      this._view.redirectToLogin();
      return;
    }

    this._view.render();
    this._view.setOnStoryItemClick((story) => {
      this._view.focusMapOnStory(story);
    });

    try {
      const stories = await StoryModel.getAllStories();

      await putStories(stories);

      this._view.renderStoryList(stories);
      this._view.renderMap(stories);
      await this._view.bindOfflineButtons();
    } catch (error) {
      const cached = await getAllStoriesIDB();
      if (cached.length) {
        this._view.renderStoryList(cached);
        this._view.renderMap(cached);
        await this._view.bindOfflineButtons();
      } else {
        this._view.showError(
          `Gagal memuat cerita: ${error.message}. Mungkin sesi Anda telah berakhir, silakan <a href="#/login">login kembali</a>.`
        );
      }

      StoryModel.removeAuthToken();
    }
  }
}

export default HomePresenter;
